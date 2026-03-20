'use client'

import dynamic from 'next/dynamic'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

const PDFViewerClient = dynamic(
  () => import('./PDFViewerClient').then((mod) => ({ default: mod.PDFViewerClient })),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    ),
  }
)

interface PDFViewerProps {
  url: string
  title: string
}

export function PDFViewer({ url, title }: PDFViewerProps) {
  return <PDFViewerClient url={url} title={title} />
}
