import { Badge } from '@/components/ui/badge'

type ProgressStatus = 'not_started' | 'in_progress' | 'passed'

const statusConfig: Record<ProgressStatus, { label: string; variant: 'outline' | 'warning' | 'success' }> = {
  not_started: { label: '未開始', variant: 'outline' },
  in_progress: { label: '学習中', variant: 'warning' },
  passed: { label: '合格', variant: 'success' },
}

export function StatusBadge({ status }: { status: ProgressStatus | null | undefined }) {
  if (!status) return <Badge variant="outline">未開始</Badge>
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
