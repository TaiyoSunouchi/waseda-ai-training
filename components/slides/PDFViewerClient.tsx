'use client'

import { useState, useCallback, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ChevronLeft, ChevronRight } from 'lucide-react'

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerClientProps {
  url: string
  title: string
}

export function PDFViewerClient({ url, title }: PDFViewerClientProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pageWidth, setPageWidth] = useState(800)

  useEffect(() => {
    setPageWidth(Math.min(window.innerWidth - 64, 800))
    const handleResize = () => setPageWidth(Math.min(window.innerWidth - 64, 800))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
  }, [])

  const onDocumentLoadError = useCallback((err: Error) => {
    setError('PDFの読み込みに失敗しました: ' + err.message)
    setLoading(false)
  }, [])

  const prevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1))
  const nextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages))

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

      {error ? (
        <div className="p-4 bg-red-50 rounded-lg text-red-600 text-sm">{error}</div>
      ) : (
        <>
          {loading && <LoadingSpinner size="lg" />}
          <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={<LoadingSpinner size="lg" className="m-8" />}
            >
              <Page
                pageNumber={pageNumber}
                width={pageWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>

          {!loading && numPages > 0 && (
            <div className="flex items-center gap-4">
              <Button
                onClick={prevPage}
                disabled={pageNumber <= 1}
                variant="outline"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
                前へ
              </Button>
              <span className="text-sm text-gray-600">
                {pageNumber} / {numPages} ページ
              </span>
              <Button
                onClick={nextPage}
                disabled={pageNumber >= numPages}
                variant="outline"
                size="sm"
              >
                次へ
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
