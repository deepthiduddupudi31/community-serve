"use client"

import type React from "react"
import { useAuth } from "../contexts/AuthContext"
import EventList from "../components/EventList"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Heart, Users, Calendar, MapPin } from "lucide-react"
import Link from "next/link"

const HomePage: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Make a Difference in Your Community</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with local volunteer opportunities and create meaningful impact through service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link href="/create-event">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create Event
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    My Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SocialServe?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Make Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create meaningful change in your community through organized volunteer efforts.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Meet like-minded individuals who share your passion for community service.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Organize</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Easily create and manage volunteer events with our intuitive platform.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                <CardTitle>Local Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find volunteer opportunities right in your neighborhood and nearby areas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-muted-foreground">Discover volunteer opportunities happening in your community</p>
          </div>
          <EventList />
        </div>
      </section>
    </div>
  )
}

export default HomePage
