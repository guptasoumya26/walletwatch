'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save, Edit, X } from 'lucide-react'
import { User } from '@/lib/auth'

interface NotesSectionProps {
  user: User
  currentMonth: string
}

export default function NotesSection({ user, currentMonth }: NotesSectionProps) {
  const [noteContent, setNoteContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchNote = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/notes?user_id=${user.id}&month=${currentMonth}`
      )

      if (response.ok) {
        const data = await response.json()
        setNoteContent(data.note?.note_content || '')
      } else {
        setError('Failed to load note')
      }
    } catch (error) {
      console.error('Error fetching note:', error)
      setError('Failed to load note')
    } finally {
      setIsLoading(false)
    }
  }, [user.id, currentMonth])

  useEffect(() => {
    fetchNote()
  }, [fetchNote])

  const handleSave = async () => {
    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          month: currentMonth,
          note_content: noteContent,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save note')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      setError('Failed to save note')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    fetchNote()
    setError('')
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          My Notes
        </h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          My Notes
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            placeholder="Add your notes for this month..."
            className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
          />

          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>

            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-[120px]">
          {noteContent ? (
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {noteContent}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No notes added yet. Click Edit to add your notes.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}