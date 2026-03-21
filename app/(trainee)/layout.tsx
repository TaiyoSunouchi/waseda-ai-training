import { Navbar } from '@/components/layout/Navbar'
import { FloatingMascot } from '@/components/mascot/FloatingMascot'

export default function TraineeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F2F5FA]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <FloatingMascot />
    </div>
  )
}
