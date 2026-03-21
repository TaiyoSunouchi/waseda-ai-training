'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { useCallback, useRef, useState } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Code, Link as LinkIcon,
  Image as ImageIcon, Minus, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Loader2,
} from 'lucide-react'
import { uploadContentImage } from '@/lib/actions/content-images'
import { saveStageContent } from '@/lib/actions/stages'

interface RichTextEditorProps {
  stageId: string
  initialContent?: string | null
}

// 画像のwidth属性をサポートするカスタム拡張
const ResizableImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return {
            style: `width: ${attributes.width}; height: auto; display: block;`,
          }
        },
        parseHTML: (element) => {
          const style = element.getAttribute('style')
          if (!style) return null
          const match = style.match(/width:\s*([^;]+)/)
          return match ? match[1].trim() : null
        },
      },
    }
  },
})

function ToolbarBtn({
  onClick, active, title, children, disabled,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded-md transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />
}

const IMAGE_WIDTHS = [
  { label: '25%', value: '25%' },
  { label: '50%', value: '50%' },
  { label: '75%', value: '75%' },
  { label: '100%', value: '100%' },
]

export function RichTextEditor({ stageId, initialContent }: RichTextEditorProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'error'>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerSave = useCallback(async (html: string) => {
    setSaveStatus('saving')
    const result = await saveStageContent(stageId, html)
    setSaveStatus(result?.error ? 'error' : 'saved')
    if (!result?.error) setTimeout(() => setSaveStatus('idle'), 2000)
  }, [stageId])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      ResizableImage.configure({
        HTMLAttributes: { class: 'rounded-xl my-6 mx-auto shadow-sm' },
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline hover:text-blue-800 cursor-pointer', rel: 'noopener noreferrer' },
      }),
      Placeholder.configure({ placeholder: 'ここに講義内容を入力してください...' }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: { class: 'editor-content focus:outline-none min-h-[560px]' },
    },
    onUpdate: ({ editor }) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      setSaveStatus('idle')
      saveTimerRef.current = setTimeout(() => triggerSave(editor.getHTML()), 1500)
    },
  })

  const insertLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URLを入力してください:', prev || 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const handleImageFile = useCallback(async (file: File) => {
    if (!editor) return
    setUploadStatus('uploading')
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const result = await uploadContentImage(fd)
      if (result?.error) {
        setUploadStatus('error')
        setUploadError(result.error)
        setTimeout(() => { setUploadStatus('idle'); setUploadError(null) }, 5000)
      } else if (result?.data) {
        editor.chain().focus().setImage({ src: result.data }).run()
        setUploadStatus('idle')
      } else {
        setUploadStatus('error')
        setUploadError('アップロードに失敗しました（応答なし）')
        setTimeout(() => { setUploadStatus('idle'); setUploadError(null) }, 5000)
      }
    } catch (e) {
      console.error('Image upload exception:', e)
      setUploadStatus('error')
      setUploadError('アップロード中にエラーが発生しました')
      setTimeout(() => { setUploadStatus('idle'); setUploadError(null) }, 5000)
    }
  }, [editor])

  const isImageSelected = editor?.isActive('image') ?? false
  const currentImageWidth = editor?.getAttributes('image').width ?? null

  if (!editor) return <div className="h-96 animate-pulse bg-gray-50 rounded-xl" />

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      {/* ===== Toolbar ===== */}
      <div className="sticky top-16 z-20 bg-[#F9F9F8] border-b border-gray-200 shadow-md px-4 py-2 flex items-center flex-wrap gap-0.5 rounded-t-2xl">
        {/* Undo / Redo */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} title="元に戻す">
          <Undo className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} title="やり直し">
          <Redo className="w-4 h-4" />
        </ToolbarBtn>
        <Sep />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="見出し1">
          <Heading1 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="見出し2">
          <Heading2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="見出し3">
          <Heading3 className="w-4 h-4" />
        </ToolbarBtn>
        <Sep />

        {/* Text style */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="太字 (⌘B)">
          <Bold className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体 (⌘I)">
          <Italic className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="下線 (⌘U)">
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="取り消し線">
          <Strikethrough className="w-4 h-4" />
        </ToolbarBtn>
        <Sep />

        {/* Align */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="左揃え">
          <AlignLeft className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="中央揃え">
          <AlignCenter className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="右揃え">
          <AlignRight className="w-4 h-4" />
        </ToolbarBtn>
        <Sep />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="箇条書き">
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="番号リスト">
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>
        <Sep />

        {/* Blocks */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="引用">
          <Quote className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="コードブロック">
          <Code className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="区切り線">
          <Minus className="w-4 h-4" />
        </ToolbarBtn>
        <Sep />

        {/* Link & Image */}
        <ToolbarBtn onClick={insertLink} active={editor.isActive('link')} title="リンク挿入">
          <LinkIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => fileInputRef.current?.click()}
          title="画像挿入"
          disabled={uploadStatus === 'uploading'}
        >
          {uploadStatus === 'uploading'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <ImageIcon className="w-4 h-4" />
          }
        </ToolbarBtn>

        {/* 画像選択時: サイズ変更コントロール */}
        {isImageSelected && (
          <>
            <Sep />
            <span className="text-xs text-gray-400 px-1 flex-shrink-0">画像幅:</span>
            {IMAGE_WIDTHS.map(({ label, value }) => (
              <ToolbarBtn
                key={value}
                onClick={() => editor.chain().focus().updateAttributes('image', { width: value }).run()}
                active={currentImageWidth === value}
                title={`幅を${label}に変更`}
              >
                <span className="text-xs font-mono px-0.5">{label}</span>
              </ToolbarBtn>
            ))}
            <ToolbarBtn
              onClick={() => editor.chain().focus().updateAttributes('image', { width: null }).run()}
              active={currentImageWidth === null}
              title="幅をデフォルトに戻す"
            >
              <span className="text-xs font-mono px-0.5">auto</span>
            </ToolbarBtn>
          </>
        )}

        {/* Save status */}
        <div className="ml-auto text-xs font-medium pl-2 flex-shrink-0">
          {uploadStatus === 'uploading' && <span className="text-blue-500">画像アップロード中...</span>}
          {saveStatus === 'saving' && uploadStatus === 'idle' && <span className="text-gray-400">保存中...</span>}
          {saveStatus === 'saved' && <span className="text-emerald-500">✓ 保存済み</span>}
          {saveStatus === 'error' && <span className="text-red-500">⚠ 保存失敗</span>}
        </div>
      </div>

      {/* アップロードエラーバナー */}
      {uploadStatus === 'error' && uploadError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2 text-sm text-red-700">
          <span>⚠</span>
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => { setUploadStatus('idle'); setUploadError(null) }}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* ===== Editor area ===== */}
      <div className="max-w-[720px] mx-auto px-8 py-8">
        <EditorContent editor={editor} />
      </div>

      {/* Hidden image input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleImageFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}
