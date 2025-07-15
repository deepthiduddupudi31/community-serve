"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import "./CreateEvent.css"

const CreateEvent: React.FC = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [isVirtual, setIsVirtual] = useState(false)
  const [message, setMessage] = useState("")

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
    maxParticipants: "",
    requirements: "",
    tags: "",
    virtualLink: "",
  })

  const categories = [
    { value: "community-service", label: "Community Service" },
    { value: "environmental", label: "Environmental" },
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "social-welfare", label: "Social Welfare" },
    { value: "disaster-relief", label: "Disaster Relief" },
    { value: "other", label: "Other" },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")

    if (!token) {
      setMessage("You must be logged in to create an event")
      return
    }

    setLoading(true)

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: isVirtual ? {} : formData.location,
        maxParticipants: formData.maxParticipants ? Number.parseInt(formData.maxParticipants) : undefined,
        requirements: formData.requirements ? formData.requirements.split(",").map((req) => req.trim()) : [],
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()) : [],
        isVirtual,
        virtualLink: isVirtual ? formData.virtualLink : undefined,
      }

      const response = await axios.post("/events", eventData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.message) {
        setMessage("Event created successfully!")
        setTimeout(() => {
          navigate("/dashboard")
        }, 2000)
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to create event")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-event">
      <div className="container">
        <div className="form-container">
          <div className="form-header">
            <h1>📅 Create New Event</h1>
            <p>Organize a volunteer opportunity in your community</p>
          </div>

          <form onSubmit={handleSubmit} className="event-form">
            {message && <div className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</div>}

            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>

              <div className="form-group">
                <label htmlFor="title">Event Title *</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your event..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="form-section">
              <h3>Date and Time</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">📅 Date *</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">🕐 Time *</label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Virtual Event Toggle */}
            <div className="form-section">
              <div className="checkbox-group">
                <input
                  id="virtual"
                  type="checkbox"
                  checked={isVirtual}
                  onChange={(e) => setIsVirtual(e.target.checked)}
                />
                <label htmlFor="virtual">Virtual Event</label>
              </div>
            </div>

            {/* Location or Virtual Link */}
            {isVirtual ? (
              <div className="form-section">
                <h3>🔗 Virtual Meeting</h3>
                <div className="form-group">
                  <label htmlFor="virtualLink">Virtual Meeting Link *</label>
                  <input
                    id="virtualLink"
                    name="virtualLink"
                    type="url"
                    value={formData.virtualLink}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/j/..."
                    required={isVirtual}
                  />
                </div>
              </div>
            ) : (
              <div className="form-section">
                <h3>📍 Location</h3>

                <div className="form-group">
                  <label htmlFor="location.address">Street Address *</label>
                  <input
                    id="location.address"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    required={!isVirtual}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location.city">City *</label>
                    <input
                      id="location.city"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required={!isVirtual}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="location.state">State *</label>
                    <input
                      id="location.state"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      required={!isVirtual}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="location.zipCode">ZIP Code *</label>
                    <input
                      id="location.zipCode"
                      name="location.zipCode"
                      value={formData.location.zipCode}
                      onChange={handleInputChange}
                      placeholder="12345"
                      required={!isVirtual}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="form-section">
              <h3>Additional Details</h3>

              <div className="form-group">
                <label htmlFor="maxParticipants">👥 Max Participants (Optional)</label>
                <input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="form-group">
                <label htmlFor="requirements">Requirements (Optional)</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  placeholder="Enter requirements separated by commas"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags">🏷️ Tags (Optional)</label>
                <input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Creating Event..." : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateEvent
