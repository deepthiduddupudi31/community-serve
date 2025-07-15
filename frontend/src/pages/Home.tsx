"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import EventList from "../components/EventList"
import "./Home.css"

const Home: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Make a Difference in Your Community</h1>
          <p>Connect with local volunteer opportunities and create meaningful impact through service.</p>
          <div className="hero-buttons">
            {user ? (
              <>
                <Link to="/create-event" className="btn btn-primary">
                  Create Event
                </Link>
                <Link to="/dashboard" className="btn btn-outline">
                  My Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose SocialServe?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">❤️</div>
              <h3>Make Impact</h3>
              <p>Create meaningful change in your community through organized volunteer efforts.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Connect</h3>
              <p>Meet like-minded individuals who share your passion for community service.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Organize</h3>
              <p>Easily create and manage volunteer events with our intuitive platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Local Focus</h3>
              <p>Find volunteer opportunities right in your neighborhood and nearby areas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="events-section">
        <div className="container">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <p>Discover volunteer opportunities happening in your community</p>
          </div>
          <EventList />
        </div>
      </section>
    </div>
  )
}

export default Home
