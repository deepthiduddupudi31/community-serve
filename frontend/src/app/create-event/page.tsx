"use client"

import type React from "react"
import { useAuth } from "../../contexts/AuthContext"
import CreateEventForm from "../../components/CreateEventForm"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const CreateEventPage: React.FC = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleEventCreated = () => {
    router.push("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateEventForm onEventCreated={handleEventCreated} />
    </div>
  )
}

export default CreateEventPage
