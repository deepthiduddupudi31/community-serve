"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "./../contexts/AuthContext"
import { Button } from "./../components/ui/button"
import { Input } from "./../components/ui/input"
import { Textarea } from "./../components/ui/textarea"
import { Label } from "./../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./../components/ui/select"
import { Switch } from "./../components/ui/switch"
import { Calendar, Clock, MapPin, Users, Tag, LinkIcon } from "lucide-react"
import { useToast } from "./../hooks/use-toast"

interface CreateEventFormProps {
  onEventCreated?: () => void
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onEventCreated }) => {
  const { token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isVirtual, setIsVirtual] = useState(false)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    if (!token) {
      toast({
        title: "Error",
        variant: "destructive",
      })
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          variant: "default",
        })

        // Reset form
        setFormData({
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
        setIsVirtual(false)

        if (onEventCreated) {
          onEventCreated()
        }
      } else {
        throw new Error(data.message || "Failed to create event")
      }
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Create New Event
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
            </div>

            <div>
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time *
              </Label>
              <Input id="time" name="time" type="time" value={formData.time} onChange={handleInputChange} required />
            </div>
          </div>

          {/* Virtual Event Toggle */}
          <div className="flex items-center space-x-2">
            <Switch id="virtual" checked={isVirtual} onCheckedChange={setIsVirtual} />
            <Label htmlFor="virtual">Virtual Event</Label>
          </div>

          {/* Location or Virtual Link */}
          {isVirtual ? (
            <div>
              <Label htmlFor="virtualLink" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Virtual Meeting Link *
              </Label>
              <Input
                id="virtualLink"
                name="virtualLink"
                type="url"
                value={formData.virtualLink}
                onChange={handleInputChange}
                placeholder="https://zoom.us/j/..."
                required={isVirtual}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location *
              </Label>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                  required={!isVirtual}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    required={!isVirtual}
                  />
                  <Input
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    required={!isVirtual}
                  />
                  <Input
                    name="location.zipCode"
                    value={formData.location.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                    required={!isVirtual}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="maxParticipants" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Max Participants (Optional)
              </Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min="1"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div>
              <Label htmlFor="requirements">Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="Enter requirements separated by commas"
                className="min-h-[80px]"
              />
            </div>

            <div>
              <Label htmlFor="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags (Optional)
              </Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating Event..." : "Create Event"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default CreateEventForm
