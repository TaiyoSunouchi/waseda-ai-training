'use client'

import { useState } from 'react'
import { enterAsTrainee } from '@/lib/actions/auth'

export function TraineeForm() {
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await enterAsTrainee(nickname)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1.5">
          ニックネーム
        </label>
        <input
          id="nickname"
          type="text"
          autoComplete="nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="input-premium"
          placeholder="わせだベア"
          maxLength={50}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || !nickname.trim()}
        className="btn-navy w-full justify-center"
      >
        {loading ? '入場中...' : 'はじめる'}
      </button>
    </form>
  )
}
