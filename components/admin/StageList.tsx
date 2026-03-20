'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { reorderStages } from '@/lib/actions/stages'
import { AdminStageActions } from '@/app/(admin)/admin/courses/[courseId]/admin-stage-actions'
import type { Stage } from '@/lib/supabase/types'

function SortableStageItem({ stage, courseId }: { stage: Stage; courseId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stage.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card-premium flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-300 hover:text-gray-500 touch-none flex-shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400 w-5 text-center flex-shrink-0">{stage.order_index}</span>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-[#0B2447] truncate">{stage.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">合格ライン: {stage.pass_threshold}%</p>
        </div>
      </div>
      <AdminStageActions stage={stage} courseId={courseId} />
    </div>
  )
}

export function StageList({ stages: initialStages, courseId }: { stages: Stage[]; courseId: string }) {
  const [stages, setStages] = useState(initialStages)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = stages.findIndex((s) => s.id === active.id)
    const newIndex = stages.findIndex((s) => s.id === over.id)
    const newStages = arrayMove(stages, oldIndex, newIndex)

    setStages(newStages)
    setSaving(true)
    await reorderStages(courseId, newStages.map((s) => s.id))
    setSaving(false)
  }

  return (
    <div>
      {saving && (
        <p className="text-xs text-gray-400 mb-2">並び替えを保存中...</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {stages.map((stage) => (
              <SortableStageItem key={stage.id} stage={stage} courseId={courseId} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
