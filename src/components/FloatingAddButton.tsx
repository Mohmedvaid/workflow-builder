import { Plus } from 'lucide-react'

interface FloatingAddButtonProps {
  onClick: () => void
}

export default function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed top-20 right-6 w-12 h-12 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-all hover:scale-105 flex items-center justify-center z-30"
      title="Add Node"
    >
      <Plus className="w-6 h-6" />
    </button>
  )
}
