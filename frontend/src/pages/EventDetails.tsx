"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import "./EventDetails.css"

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
    bio?: string
  }
  maxParticipants?: number
  currentParticipants: number
  participants: Array<{
    _id: string
    username: string
    firstName?: string
    lastName?: string
    profilePicture?: string
  }>
  requirements?: string[]
  tags: string[]
  isVirtual: boolean
  virtualLink?: string
  status: string
  createdAt: string
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (id) {
      fetchEvent()
    }
  }, [id])

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`/events/${id}`)
      if (response.data.event) {
        setEvent(response.data.event)
      }
    } catch (error) {
      console.error("Error fetching event:", error)
      navigate("/events")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEvent = async () => {
    if (!token) {
      setMessage("You must be logged in to join events")
      return
    }

    setActionLoading(true)
    setMessage("")

    try {
      const response = await axios.post(
        `/events/${id}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.message) {
        setMessage(response.data.message)
        fetchEvent() // Refresh event data
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to join event")
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeaveEvent = async () => {
    if (!token) return

    setActionLoading(true)
    setMessage("")

    try {
      const response = await axios.post(
        `/events/${id}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.message) {
        setMessage(response.data.message)
        fetchEvent() // Refresh event data
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to leave event")
    } finally {
      setActionLoading(false)
    }
  }

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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading event details...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="error-container">
        <h2>Event not found</h2>
        <button onClick={() => navigate("/events")} className="btn btn-primary">
          Back to Events
        </button>
      </div>
    )
  }

  const isParticipant = user && event.participants.some((p) => p._id === user.id)
  const isOrganizer = user && event.organizer._id === user.id
  const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants

  return (
    <div className="event-details">
      <div className="container">
        <button onClick={() => navigate("/events")} className="back-btn">
          ← Back to Events
        </button>

        <div className="event-details-container">
          {/* Event Header */}
          <div className="event-header">
            <div className="event-title-section">
              <h1 className="event-title">{event.title}</h1>
              <span className={`category-badge ${getCategoryColor(event.category)}`}>
                {event.category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </div>

            <div className="event-meta">
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
                    {event.location?.address && `${event.location.address}, `}
                    {event.location?.city && event.location?.state
                      ? `${event.location.city}, ${event.location.state}`
                      : "Location TBD"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="event-content-grid">
            {/* Main Content */}
            <div className="event-main-content">
              <div className="event-description">
                <h3>About This Event</h3>
                <p>{event.description}</p>
              </div>

              {event.requirements && event.requirements.length > 0 && (
                <div className="event-requirements">
                  <h3>Requirements</h3>
                  <ul>
                    {event.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {event.tags.length > 0 && (
                <div className="event-tags-section">
                  <h3>Tags</h3>
                  <div className="event-tags">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {event.isVirtual && event.virtualLink && isParticipant && (
                <div className="virtual-link">
                  <h3>Virtual Meeting Link</h3>
                  <a href={event.virtualLink} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
                    🔗 Join Virtual Event
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="event-sidebar">
              {/* Organizer Info */}
              <div className="organizer-card">
                <h3>Organized by</h3>
                <div className="organizer-info">
                  <div className="organizer-avatar">
                    {event.organizer.firstName?.[0] || event.organizer.username[0]}
                  </div>
                  <div className="organizer-details">
                    <h4>
                      {event.organizer.firstName && event.organizer.lastName
                        ? `${event.organizer.firstName} ${event.organizer.lastName}`
                        : event.organizer.username}
                    </h4>
                    <p>@{event.organizer.username}</p>
                    {event.organizer.bio && <p className="organizer-bio">{event.organizer.bio}</p>}
                  </div>
                </div>
              </div>

              {/* Participation Info */}
              <div className="participation-card">
                <h3>Participation</h3>
                <div className="participation-stats">
                  <div className="stat">
                    <span className="stat-number">{event.currentParticipants}</span>
                    <span className="stat-label">
                      {event.currentParticipants === 1 ? "Participant" : "Participants"}
                    </span>
                  </div>
                  {event.maxParticipants && (
                    <div className="stat">
                      <span className="stat-number">{event.maxParticipants}</span>
                      <span className="stat-label">Max Capacity</span>
                    </div>
                  )}
                </div>

                {message && (
                  <div className={`message ${message.includes("Success") ? "success" : "error"}`}>{message}</div>
                )}

                {/* Action Buttons */}
                <div className="event-actions">
                  {!isOrganizer && user && (
                    <>
                      {isParticipant ? (
                        <button
                          onClick={handleLeaveEvent}
                          disabled={actionLoading}
                          className="btn btn-outline btn-full"
                        >
                          {actionLoading ? "Leaving..." : "Leave Event"}
                        </button>
                      ) : (
                        <button
                          onClick={handleJoinEvent}
                          disabled={actionLoading}
                          className="btn btn-primary btn-full"
                        >
                          {actionLoading ? "Joining..." : "Join Event"}
                        </button>
                      )}
                    </>
                  )}

                  {isOrganizer && <span className="organizer-badge">You're the organizer</span>}

                  {!user && (
                    <div className="login-prompt">
                      <p>Please log in to join this event</p>
                      <button onClick={() => navigate("/login")} className="btn btn-primary btn-full">
                        Sign In
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Participants List (for organizers) */}
              {isOrganizer && event.participants.length > 0 && (
                <div className="participants-card">
                  <h3>Registered Participants ({event.participants.length})</h3>
                  <div className="participants-list">
                    {event.participants.map((participant) => (
                      <div key={participant._id} className="participant-item">
                        <div className="participant-avatar">
                          {participant.firstName?.[0] || participant.username[0]}
                        </div>
                        <div className="participant-info">
                          <span className="participant-name">
                            {participant.firstName && participant.lastName
                              ? `${participant.firstName} ${participant.lastName}`
                              : participant.username}
                          </span>
                          <span className="participant-username">@{participant.username}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
