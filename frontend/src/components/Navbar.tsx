"use client"

import type React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "./Navbar.css"

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">❤️</span>
          SocialServe
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          <Link to="/events" className="navbar-link">
            Events
          </Link>

          {user ? (
            <>
              {/* Only show Create Event for organizers */}
              {user.userType === "organizer" && (
                <Link to="/create-event" className="navbar-link">
                  Create Event
                </Link>
              )}
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
              {/* Logout Button */}
              <button onClick={handleLogout} className="btn btn-outline logout-btn">
                Logout
              </button>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
