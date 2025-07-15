"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import "./Profile.css"

const Profile: React.FC = () => {
  const { user, token, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    skills: [] as string[],
    interests: [] as string[],
  })

  const [newSkill, setNewSkill] = useState("")
  const [newInterest, setNewInterest] = useState("")

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        location: user.location || "",
        skills: user.skills || [],
        interests: user.interests || [],
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }))
      setNewInterest("")
    }
  }

  const removeInterest = (interestToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((interest) => interest !== interestToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    try {
      const response = await axios.put("/auth/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.user) {
        updateUser(response.data.user)
        setIsEditing(false)
        setMessage("Profile updated successfully!")
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        location: user.location || "",
        skills: user.skills || [],
        interests: user.interests || [],
      })
    }
    setIsEditing(false)
    setMessage("")
  }

  // Calculate user level based on activities
  const calculateLevel = () => {
    // const eventsJoined = user?.eventsJoined || 0
    // const eventsOrganized = user?.eventsOrganized || 0
    // const totalActivity = eventsJoined + eventsOrganized * 2
    // return Math.floor(totalActivity / 5) + 1
    return 1
  }

  // Get user badges
  // const getUserBadges = () => {
  //   const badges = []
  //   // const eventsJoined = user?.eventsJoined || 0
  //   // const eventsOrganized = user?.eventsOrganized || 0

  //   // if (eventsJoined >= 1) badges.push("🌟 First Timer")
  //   // if (eventsJoined >= 5) badges.push("🏆 Active Volunteer")
  //   // if (eventsJoined >= 10) badges.push("💎 Super Volunteer")
  //   // if (eventsOrganized >= 1) badges.push("👨‍💼 Event Organizer")
  //   // if (eventsOrganized >= 5) badges.push("🎯 Community Leader")

  //   return badges
  // }

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  const userLevel = calculateLevel()
  // const userBadges = getUserBadges()

  return (
    <div className="profile">
      <div className="container">
        <div className="profile-container">
          {/* Profile Header */}
          <div className="profile-hero">
            <div className="profile-avatar-large">
              {user.firstName?.[0] || user.username[0]}
              {user.lastName?.[0] || ""}
            </div>
            <div className="profile-hero-info">
              <h1>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}</h1>
              <p className="profile-username">@{user.username}</p>
              <p className="profile-email">📧 {user.email}</p>
              <div className="profile-type">
                <span className={`user-type-badge ${user.userType}`}>
                  {user.userType === "volunteer" ? "🙋‍♀️ Volunteer" : "👨‍💼 Organizer"}
                </span>
              </div>
            </div>
            <div className="profile-actions">
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="btn btn-primary">
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Stats and Rewards */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Level {userLevel}</h3>
                <p>User Level</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                {/* <h3>{user.eventsJoined || 0}</h3> */}
                <p>Events Joined</p>
              </div>
            </div>

            {user.userType === "organizer" && (
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  {/* <h3>{user.eventsOrganized || 0}</h3> */}
                  <p>Events Organized</p>
                </div>
              </div>
            )}

            <div className="stat-card">
              <div className="stat-icon">⏰</div>
              <div className="stat-content">
                {/* <h3>{user.totalVolunteerHours || 0}h</h3> */}
                <p>Volunteer Hours</p>
              </div>
            </div>
          </div>

          {/* Badges/Rewards */}
            {/* {userBadges.length > 0 && (
              <div className="profile-section">
                <h3>🏆 Achievements & Badges</h3>
                <div className="badges-container">
                  {userBadges.map((badge, index) => (
                    <span key={index} className="badge">
                      {badge}
                    </span>
                  ))}
              </div>
            </div>
          )} */}

          <form onSubmit={handleSubmit} className="profile-form">
            {message && <div className={`message ${message.includes("success") ? "success" : "error"}`}>{message}</div>}

            {/* Basic Information */}
            <div className="profile-section">
              <h3>👤 Basic Information</h3>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">📍 Location</label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="City, State"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="profile-section">
              <h3>💪 Skills</h3>
              <div className="tags-container">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="tag skill-tag">
                    {skill}
                    {isEditing && (
                      <button type="button" onClick={() => removeSkill(skill)} className="tag-remove">
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="add-tag">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  />
                  <button type="button" onClick={addSkill} className="btn btn-outline">
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Interests */}
            <div className="profile-section">
              <h3>❤️ Interests</h3>
              <div className="tags-container">
                {formData.interests.map((interest, index) => (
                  <span key={index} className="tag interest-tag">
                    {interest}
                    {isEditing && (
                      <button type="button" onClick={() => removeInterest(interest)} className="tag-remove">
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="add-tag">
                  <input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add an interest"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                  />
                  <button type="button" onClick={addInterest} className="btn btn-outline">
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={handleCancel} className="btn btn-outline">
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
