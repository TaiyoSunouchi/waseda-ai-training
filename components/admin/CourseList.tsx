'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { reorderCourses } from '@/lib/actions/courses'
import { Badge } from '@/components/ui/badge'
import { AdminCourseActions } from '@/app/(admin)/admin/dashboard/admin-course-actions'
import type { Course } from '@/lib/supabase/types'

function SortableCourseItem({ course }: { course: Course }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: course.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="card-premium p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-300 hover:text-gray-500 touch-none flex-shrink-0"
            aria-label="ドラッグして並び替え"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href={`/admin/courses/${course.id}`}
                className="font-semibold text-[#0B2447] hover:text-[#163A6E] transition-colors"
              >
                {course.title}
              </Link>
              <Badge variant={course.is_published ? 'success' : 'secondary'}>
                {course.is_published ? '公開中' : '非公開'}
              </Badge>
            </div>
            {course.description && (
              <p className="text-sm text-gray-500 mt-1 truncate">{course.description}</p>
            )}
          </div>
        </div>
        <AdminCourseActions course={course} />
      </div>
    </div>
  )
}

export function CourseList({ courses: initialCourses }: { courses: Course[] }) {
  const [courses, setCourses] = useState(initialCourses)
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

    const oldIndex = courses.findIndex((c) => c.id === active.id)
    const newIndex = courses.findIndex((c) => c.id === over.id)
    const newCourses = arrayMove(courses, oldIndex, newIndex)

    setCourses(newCourses)
    setSaving(true)
    await reorderCourses(newCourses.map((c) => c.id))
    setSaving(false)
  }

  return (
    <div>
      {saving && (
        <p className="text-xs text-gray-400 mb-2">並び替えを保存中...</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={courses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {courses.map((course) => (
              <SortableCourseItem key={course.id} course={course} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
