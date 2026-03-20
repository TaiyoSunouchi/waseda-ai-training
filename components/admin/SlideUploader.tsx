'use client'

import { useState, useRef } from 'react'
import { uploadSlide, deleteSlide } from '@/lib/actions/slides'
import type { Slide } from '@/lib/supabase/types'

interface SlideUploaderProps {
  stageId: string
  slides: Slide[]
}

export function SlideUploader({ stageId, slides: initialSlides }: SlideUploaderProps) {
  const [slides, setSlides] = useState(initialSlides)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget  // awaitの前に参照を保存
    setUploading(true)
    setError(null)

    const formData = new FormData(form)
    const result = await uploadSlide(stageId, formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.data) {
      setSlides((prev) => [...prev, result.data as Slide])
      form.reset()
      if (fileRef.current) fileRef.current.value = ''
    }
    setUploading(false)
  }

  const handleDelete = async (slide: Slide) => {
    if (!confirm(`「${slide.title}」を削除しますか？`)) return
    const result = await deleteSlide(slide.id, stageId)
    if (!result?.error) {
      setSlides((prev) => prev.filter((s) => s.id !== slide.id))
    }
  }

  return (
    <div className="space-y-6">
      {/* アップロードフォーム */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">PDFスライドをアップロード</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              PDFファイル（最大50MB）
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="application/pdf"
              required
              ref={fileRef}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border file:border-gray-300 file:rounded file:text-sm file:bg-white file:cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {uploading ? 'アップロード中...' : 'アップロード'}
          </button>
        </form>
      </div>

      {/* スライド一覧 */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          登録済みスライド ({slides.length})
        </h2>
        {slides.length === 0 ? (
          <p className="text-sm text-gray-500">スライドがまだありません。</p>
        ) : (
          <div className="space-y-2">
            {slides
              .sort((a, b) => a.order_index - b.order_index)
              .map((slide) => (
                <div key={slide.id} className="flex items-center justify-between bg-white border rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{slide.title}</p>
                    <p className="text-xs text-gray-500">順序: {slide.order_index}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(slide)}
                    className="text-sm text-red-600 hover:bg-red-50 px-3 py-1 border border-red-200 rounded"
                  >
                    削除
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
