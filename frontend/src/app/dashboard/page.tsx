"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Calendar, Users, Plus, MapPin, Clock, LinkIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "../../hooks/use-toast"

interface Event {
  _id: string
  title: string
  description: string
  category: string
  date: string
  time: string
  location?: {
    address?: string
    city?: string
    state?: string
    zipCode?: string
  }
  organizer: {
    _id: string
    username: string
    firstName?: string
    lastName?: string
    profilePicture?: string
  }
  maxParticipants?: number
  currentParticipants: number
  participants: string[]
  requirements?: string[]
  tags: string[]
  isVirtual: boolean
  virtualLink?: string
  status: string
  createdAt: string
}

const DashboardPage: React.FC = () => {
  const { user, loading, token } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([])
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && token) {
      fetchUserEvents()
      fetchJoinedEvents()
    }
  }, [user, token])

  const fetchUserEvents = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/events/user/organized`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setOrganizedEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching organized events:", error)
    }
  }

  const fetchJoinedEvents = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/events/user/joined`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setJoinedEvents(data.events)
      }
    } catch (error) {
      console.error("Error fetching joined events:", error)
    } finally {
      setLoadingEvents(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "community-service": "bg-blue-100 text-blue-800",
      environmental: "bg-green-100 text-green-800",
      education: "bg-purple-100 text-purple-800",
      healthcare: "bg-red-100 text-red-800",
      "social-welfare": "bg-yellow-100 text-yellow-800",
      "disaster-relief": "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    }
    return colors[category] || colors.other
  }

  const EventCard: React.FC<{ event: Event; isOrganizer?: boolean }> = ({ event, isOrganizer = false }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
            <Badge className={getCategoryColor(event.category)}>
              {event.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Badge>
          </div>
          {isOrganizer && (
            <Badge variant="secondary" className="ml-2">
              Organizer
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>{formatTime(event.time)}</span>
          </div>

          {event.isVirtual ? (
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4" />
              <span>Virtual Event</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>
                {event.location?.city && event.location?.state
                  ? `${event.location.city}, ${event.location.state}`
                  : "Location TBD"}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>
              {event.currentParticipants} participant{event.currentParticipants !== 1 ? "s" : ""}
              {event.maxParticipants && ` / ${event.maxParticipants} max`}
            </span>
          </div>
        </div>

        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && <span className="text-xs text-muted-foreground">+{event.tags.length - 3}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (loading || loadingEvents) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}!
        </h1>
        <p className="text-muted-foreground">Manage your volunteer activities and track your impact.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Organized</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizedEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Joined</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{joinedEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impact</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizedEvents.reduce((sum, event) => sum + event.currentParticipants, 0)}
            </div>
            <p className="text-xs text-muted-foreground">People helped through your events</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/create-event">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
          </Link>
          <Link href="/events">
            <Button variant="outline">Browse Events</Button>
          </Link>
          <Link href="/profile">
            <Button variant="outline">Edit Profile</Button>
          </Link>
        </div>
      </div>

      {/* Events Tabs */}
      <Tabs defaultValue="organized" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organized">My Events ({organizedEvents.length})</TabsTrigger>
          <TabsTrigger value="joined">Joined Events ({joinedEvents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="organized" className="space-y-6">
          {organizedEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No events organized yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start making a difference by creating your first volunteer event.
                </p>
                <Link href="/create-event">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizedEvents.map((event) => (
                <EventCard key={event._id} event={event} isOrganizer={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="joined" className="space-y-6">
          {joinedEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No events joined yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Discover volunteer opportunities and start making an impact in your community.
                </p>
                <Link href="/events">
                  <Button>Browse Available Events</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DashboardPage
