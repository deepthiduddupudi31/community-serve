"use client"

import type React from "react"
import { useState } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import "./EventCard.css"

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

interface EventCardProps {
  event: Event
  onEventUpdate?: () => void
}

const EventCard: React.FC<EventCardProps> = ({ event, onEventUpdate }) => {
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const isParticipant = user && event.participants.includes(user.id)
  const isOrganizer = user && event.organizer._id === user.id
  const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
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
      "community-service": "category-blue",
      environmental: "category-green",
      education: "category-purple",
      healthcare: "category-red",
      "social-welfare": "category-yellow",
      "disaster-relief": "category-orange",
      other: "category-gray",
    }
    return colors[category] || colors.other
  }

  const handleJoinEvent = async () => {
    if (!token) {
      setMessage("You must be logged in to join events")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const response = await axios.post(
        `/events/${event._id}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.message) {
        setMessage(response.data.message)
        if (onEventUpdate) {
          onEventUpdate()
        }
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to join event")
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveEvent = async () => {
    if (!token) return

    setLoading(true)
    setMessage("")

    try {
      const response = await axios.post(
        `/events/${event._id}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.message) {
        setMessage(response.data.message)
        if (onEventUpdate) {
          onEventUpdate()
        }
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to leave event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="event-card">
      <div className="event-header">
        <div className="event-title-section">
          <h3 className="event-title">{event.title}</h3>
          <span className={`category-badge ${getCategoryColor(event.category)}`}>
            {event.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>
        <div className="organizer-info">
          <div className="organizer-avatar">{event.organizer.firstName?.[0] || event.organizer.username[0]}</div>
          <span className="organizer-name">
            {event.organizer.firstName && event.organizer.lastName
              ? `${event.organizer.firstName} ${event.organizer.lastName}`
              : event.organizer.username}
          </span>
        </div>
      </div>

      <div className="event-content">
        <p className="event-description">{event.description}</p>

        <div className="event-details">
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="detail-item">
            <span className="detail-icon">🕐</span>
            <span>{formatTime(event.time)}</span>
          </div>

          {event.isVirtual ? (
            <div className="detail-item">
              <span className="detail-icon">🔗</span>
              <span>Virtual Event</span>
            </div>
          ) : (
            <div className="detail-item">
              <span className="detail-icon">📍</span>
              <span>
                {event.location?.city && event.location?.state
                  ? `${event.location.city}, ${event.location.state}`
                  : "Location TBD"}
              </span>
            </div>
          )}

          <div className="detail-item">
            <span className="detail-icon">👥</span>
            <span>
              {event.currentParticipants} participant{event.currentParticipants !== 1 ? "s" : ""}
              {event.maxParticipants && ` / ${event.maxParticipants} max`}
            </span>
          </div>
        </div>

        {event.tags.length > 0 && (
          <div className="event-tags">
            {event.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        )}

        {event.requirements && event.requirements.length > 0 && (
          <div className="event-requirements">
            <h4>Requirements:</h4>
            <ul>
              {event.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {message && <div className={`message ${message.includes("Success") ? "success" : "error"}`}>{message}</div>}

        <div className="event-actions">
          {!isOrganizer && user && (
            <>
              {isParticipant ? (
                <button onClick={handleLeaveEvent} disabled={loading} className="btn btn-outline">
                  {loading ? "Leaving..." : "Leave Event"}
                </button>
              ) : (
                <button onClick={handleJoinEvent} disabled={loading} className="btn btn-primary">
                  {loading ? "Joining..." : isFull ? "Event Full" : "Join Event"}
                </button>
              )}
            </>
          )}

          {isOrganizer && <span className="organizer-badge">You're the organizer</span>}
        </div>
      </div>
    </div>
  )
}

export default EventCard
