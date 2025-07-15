"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import EventCard from "../components/EventCard"
import "./Dashboard.css"

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

const Dashboard: React.FC = () => {
  const { user, token } = useAuth()
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([])
  const [joinedEvents, setJoinedEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState<"organized" | "joined">("organized")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && token) {
      if (user.userType === "organizer") {
        fetchUserEvents()
      }
      fetchJoinedEvents()
    }
  }, [user, token])

  const fetchUserEvents = async () => {
    try {
      const response = await axios.get("/events/user/organized", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.events) {
        setOrganizedEvents(response.data.events)
      }
    } catch (error) {
      console.error("Error fetching organized events:", error)
    }
  }

  const fetchJoinedEvents = async () => {
    try {
      const response = await axios.get("/events/user/joined", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.events) {
        setJoinedEvents(response.data.events)
      }
    } catch (error) {
      console.error("Error fetching joined events:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEventUpdate = () => {
    if (user?.userType === "organizer") {
      fetchUserEvents()
    }
    fetchJoinedEvents()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>
            Welcome back, {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username}!
          </h1>
          <p>
            {user?.userType === "volunteer"
              ? "Discover volunteer opportunities and track your impact."
              : "Manage your volunteer events and track your impact."}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {user?.userType === "organizer" && (
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>{organizedEvents.length}</h3>
                <p>Events Organized</p>
              </div>
            </div>
          )}

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{joinedEvents.length}</h3>
              <p>Events Joined</p>
            </div>
          </div>

          {user?.userType === "organizer" && (
            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-content">
                <h3>{organizedEvents.reduce((sum, event) => sum + event.currentParticipants, 0)}</h3>
                <p>People Helped</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            {user?.userType === "organizer" && (
              <Link to="/create-event" className="btn btn-primary">
                ➕ Create New Event
              </Link>
            )}
            <Link to="/events" className="btn btn-outline">
              🔍 Browse Events
            </Link>
            <Link to="/profile" className="btn btn-outline">
              ⚙️ Edit Profile
            </Link>
          </div>
        </div>

        {/* Events Tabs */}
        <div className="events-section">
          <div className="tabs">
            {user?.userType === "organizer" && (
              <button
                className={`tab ${activeTab === "organized" ? "active" : ""}`}
                onClick={() => setActiveTab("organized")}
              >
                My Events ({organizedEvents.length})
              </button>
            )}
            <button className={`tab ${activeTab === "joined" ? "active" : ""}`} onClick={() => setActiveTab("joined")}>
              {user?.userType === "volunteer" ? "My Registered Events" : "Joined Events"} ({joinedEvents.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "organized" && user?.userType === "organizer" ? (
              <div className="events-tab">
                {organizedEvents.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <h3>No events organized yet</h3>
                    <p>Start making a difference by creating your first volunteer event.</p>
                    <Link to="/create-event" className="btn btn-primary">
                      ➕ Create Your First Event
                    </Link>
                  </div>
                ) : (
                  <div className="events-grid">
                    {organizedEvents.map((event) => (
                      <EventCard key={event._id} event={event} onEventUpdate={handleEventUpdate} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="events-tab">
                {joinedEvents.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">👥</div>
                    <h3>No events joined yet</h3>
                    <p>Discover volunteer opportunities and start making an impact in your community.</p>
                    <Link to="/events" className="btn btn-primary">
                      🔍 Browse Available Events
                    </Link>
                  </div>
                ) : (
                  <div className="events-grid">
                    {joinedEvents.map((event) => (
                      <EventCard key={event._id} event={event} onEventUpdate={handleEventUpdate} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
