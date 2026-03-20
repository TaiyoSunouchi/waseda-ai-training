'use server'

import Anthropic from '@anthropic-ai/sdk'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function generateQuizFromContent(
  stageId: string,
  count: number = 5
): Promise<{ data?: { inserted: number }; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '未認証です' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: '管理者権限が必要です' }

  const { data: stage } = await supabase
    .from('stages').select('content, title').eq('id', stageId).single()

  if (!stage?.content) {
    return { error: 'コンテンツがありません。先にコンテンツを作成してください。' }
  }

  // HTMLタグを除去してプレーンテキスト化
  const text = stage.content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length < 50) {
    return { error: 'コンテンツが少なすぎます。もう少し内容を追加してください。' }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: 'ANTHROPIC_API_KEY が設定されていません。.env.local に追加してください。' }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const prompt = `以下の講義コンテンツから、${count}問の4択クイズを作成してください。

【講義タイトル】
${stage.title}

【講義内容】
${text.slice(0, 5000)}

以下のJSON形式のみで回答してください（説明文は不要）:
[
  {
    "question": "問題文",
    "explanation": "正解の解説（なぜその答えが正解かを簡潔に）",
    "options": [
      {"text": "正解の選択肢", "is_correct": true},
      {"text": "不正解の選択肢", "is_correct": false},
      {"text": "不正解の選択肢", "is_correct": false},
      {"text": "不正解の選択肢", "is_correct": false}
    ]
  }
]

ルール:
- 各問題に正解は必ず1つだけ
- 選択肢は必ず4つ
- 講義内容に基づいた問題のみ作成
- 問題・選択肢・解説は全て日本語
- 選択肢は紛らわしく、思考を促す内容にする
- 【重要】4つの選択肢の文字数をなるべく揃えること。正解の選択肢だけが長くなったり短くなったりしないようにする。目安として、全選択肢の文字数の差が10文字以内に収まるよう調整すること
- 正解を文字数で推測できないよう、不正解の選択肢も正解と同程度の詳しさ・具体性で書くこと`

  let responseText = ''
  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })
    responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  } catch (e) {
    return { error: `Claude APIエラー: ${e instanceof Error ? e.message : '不明なエラー'}` }
  }

  // JSONを抽出
  let questions: Array<{
    question: string
    explanation: string
    options: Array<{ text: string; is_correct: boolean }>
  }>
  try {
    const match = responseText.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('JSON not found')
    questions = JSON.parse(match[0])
    if (!Array.isArray(questions)) throw new Error('Not an array')
  } catch {
    return { error: 'AIの回答の解析に失敗しました。再度お試しください。' }
  }

  // 既存クイズの最大order_indexを取得
  const { data: existing } = await supabase
    .from('quizzes')
    .select('order_index')
    .eq('stage_id', stageId)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()
  let nextOrderIndex = (existing?.order_index ?? 0) + 1

  // 問題をDBへ挿入
  let inserted = 0
  for (const q of questions) {
    const opts = q.options
    if (!Array.isArray(opts) || opts.length !== 4) continue
    const correctCount = opts.filter((o) => o.is_correct).length
    if (correctCount !== 1) continue

    const { data: quiz, error: qErr } = await supabase
      .from('quizzes')
      .insert({
        stage_id: stageId,
        question: q.question,
        explanation: q.explanation ?? null,
        order_index: nextOrderIndex,
      })
      .select()
      .single()

    if (qErr || !quiz) continue

    const { error: optsErr } = await supabase.from('quiz_options').insert(
      opts.map((o, i) => ({
        quiz_id: quiz.id,
        text: o.text,
        is_correct: o.is_correct,
        order_index: i + 1,
      }))
    )

    if (optsErr) {
      await supabase.from('quizzes').delete().eq('id', quiz.id)
      continue
    }

    inserted++
    nextOrderIndex++
  }

  revalidatePath('/admin/courses')
  return { data: { inserted } }
}
