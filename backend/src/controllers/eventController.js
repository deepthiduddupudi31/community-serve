const Event = require("../models/Event")
const mongoose = require("mongoose")

// Create event
const createEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const {
      title,
      description,
      category,
      date,
      time,
      location,
      maxParticipants,
      requirements,
      tags,
      isVirtual,
      virtualLink,
    } = req.body

    // Validation
    if (!title || !description || !category || !date || !time) {
      return res.status(400).json({ message: "Please provide all required fields" })
    }

    if (!isVirtual && (!location?.address || !location?.city || !location?.state)) {
      return res.status(400).json({ message: "Please provide complete location details for in-person events" })
    }

    if (isVirtual && !virtualLink) {
      return res.status(400).json({ message: "Please provide virtual meeting link for virtual events" })
    }

    // Create event
    const event = new Event({
      title,
      description,
      category,
      date: new Date(date),
      time,
      location: isVirtual ? {} : location,
      organizer: req.user._id,
      maxParticipants: maxParticipants || undefined,
      requirements: requirements || [],
      tags: tags || [],
      isVirtual,
      virtualLink: isVirtual ? virtualLink : undefined,
      status: "published",
    })

    const savedEvent = await event.save()
    await savedEvent.populate("organizer", "username firstName lastName profilePicture")

    res.status(201).json({
      message: "Event created successfully",
      event: savedEvent,
    })
  } catch (error) {
    console.error("Create event error:", error)
    res.status(500).json({ message: "Server error during event creation" })
  }
}

// Get all events
const getEvents = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query

    const query = { status: "published" }

    if (category && category !== "all") {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ]
    }

    const pageNum = Number.parseInt(page)
    const limitNum = Number.parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const events = await Event.find(query)
      .populate("organizer", "username firstName lastName profilePicture")
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNum)

    const total = await Event.countDocuments(query)

    res.json({
      events,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
      },
    })
  } catch (error) {
    console.error("Get events error:", error)
    res.status(500).json({ message: "Server error while fetching events" })
  }
}

// Get single event
const getEvent = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" })
    }

    const event = await Event.findById(id)
      .populate("organizer", "username firstName lastName profilePicture bio")
      .populate("participants", "username firstName lastName profilePicture")

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    res.json({ event })
  } catch (error) {
    console.error("Get event error:", error)
    res.status(500).json({ message: "Server error while fetching event" })
  }
}

// Join event
const joinEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" })
    }

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is already a participant
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({ message: "You are already registered for this event" })
    }

    // Check if event is full
    if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: "Event is full" })
    }

    // Add user to participants
    event.participants.push(req.user._id)
    event.currentParticipants += 1

    await event.save()

    res.json({ message: "Successfully joined the event" })
  } catch (error) {
    console.error("Join event error:", error)
    res.status(500).json({ message: "Server error while joining event" })
  }
}

// Leave event
const leaveEvent = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event ID" })
    }

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: "Event not found" })
    }

    // Check if user is a participant
    const participantIndex = event.participants.indexOf(req.user._id)
    if (participantIndex === -1) {
      return res.status(400).json({ message: "You are not registered for this event" })
    }

    // Remove user from participants
    event.participants.splice(participantIndex, 1)
    event.currentParticipants -= 1

    await event.save()

    res.json({ message: "Successfully left the event" })
  } catch (error) {
    console.error("Leave event error:", error)
    res.status(500).json({ message: "Server error while leaving event" })
  }
}

// Get user's events (organized)
const getUserEvents = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const events = await Event.find({ organizer: req.user._id })
      .populate("organizer", "username firstName lastName profilePicture")
      .sort({ createdAt: -1 })

    res.json({ events })
  } catch (error) {
    console.error("Get user events error:", error)
    res.status(500).json({ message: "Server error while fetching user events" })
  }
}

// Get user's joined events
const getJoinedEvents = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const events = await Event.find({ participants: req.user._id })
      .populate("organizer", "username firstName lastName profilePicture")
      .sort({ date: 1 })

    res.json({ events })
  } catch (error) {
    console.error("Get joined events error:", error)
    res.status(500).json({ message: "Server error while fetching joined events" })
  }
}

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  joinEvent,
  leaveEvent,
  getUserEvents,
  getJoinedEvents,
}
