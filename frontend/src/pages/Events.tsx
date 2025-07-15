"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import EventList from "../components/EventList"
import "./Events.css"

const Events: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="events-page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>Volunteer Events</h1>
            <p>Discover opportunities to make a difference in your community</p>
          </div>
          {/* Only show Create Event button for organizers */}
          {user && user.userType === "organizer" && (
            <Link to="/create-event" className="btn btn-primary">
              ➕ Create Event
            </Link>
          )}
        </div>

        {/* Events List */}
        <EventList />
      </div>
    </div>
  )
}

export default Events
