interface RichTextViewerProps {
  content: string | null
  className?: string
}

export function RichTextViewer({ content, className = '' }: RichTextViewerProps) {
  if (!content) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>このステージにはまだコンテンツがありません。</p>
      </div>
    )
  }

  return (
    <div
      className={`rich-text-viewer ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
