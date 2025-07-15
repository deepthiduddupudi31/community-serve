"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import EventCard from "./EventCard"
import "./EventList.css"

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

const EventList: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState("")

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "community-service", label: "Community Service" },
    { value: "environmental", label: "Environmental" },
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "social-welfare", label: "Social Welfare" },
    { value: "disaster-relief", label: "Disaster Relief" },
    { value: "other", label: "Other" },
  ]

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      })

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory)
      }

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim())
      }

      const response = await axios.get(`/events?${params}`)

      if (response.data.events) {
        setEvents(response.data.events)
        setTotalPages(response.data.pagination.pages)
      }
    } catch (error: any) {
      console.error("Error fetching events:", error)
      setError("Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [currentPage, selectedCategory])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchEvents()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  if (loading && events.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchEvents} className="btn btn-primary">
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="event-list">
      {/* Search and Filter */}
      <div className="event-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button onClick={handleSearch} className="btn btn-primary" disabled={loading}>
            Search
          </button>
        </div>

        <div className="filter-container">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="no-events">
          <p>No events found</p>
          <p>Try adjusting your search criteria or check back later for new events.</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event._id} event={event} onEventUpdate={fetchEvents} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="btn btn-outline"
          >
            Previous
          </button>

          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
            className="btn btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default EventList
