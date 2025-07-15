"use client"

import type React from "react"
import EventList from "../../components/EventList"
import { Button } from "../../components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { useAuth } from "../../contexts/AuthContext"

const EventsPage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Volunteer Events</h1>
          <p className="text-muted-foreground">Discover opportunities to make a difference in your community</p>
        </div>
        {user && (
          <Link href="/create-event">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </Link>
        )}
      </div>

      {/* Events List */}
      <EventList />
    </div>
  )
}

export default EventsPage
