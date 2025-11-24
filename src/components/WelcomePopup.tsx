import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface WelcomePopupProps {
  onClose: () => void
}

export default function WelcomePopup({ onClose }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen the welcome popup before
    const hasSeenWelcome = localStorage.getItem('workflow-builder-welcome-seen')
    if (!hasSeenWelcome) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('workflow-builder-welcome-seen', 'true')
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Welcome to Workflow Builder! 🎉</h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="prose max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed">
              <strong>Workflow Builder</strong> is a powerful, browser-based workflow automation tool that lets you create, 
              manage, and execute complex workflows entirely in your browser - no backend required!
            </p>
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Key Features:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Create visual workflows with drag-and-drop nodes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Execute workflows and see real-time data flow</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>AI-powered nodes for chat, TTS, STT, images, and more</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>JavaScript execution, API calls, file operations, and conditional logic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Reference data between nodes using <code className="bg-gray-100 px-1 rounded">$json.property</code> syntax</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Environment variables for secure API key management</span>
                </li>
              </ul>
            </div>
            <p className="mt-6 text-gray-600 italic">
              Everything runs locally in your browser - your workflows and data stay private!
            </p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

