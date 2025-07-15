const express = require("express")
const {
  createEvent,
  getEvents,
  getEvent,
  joinEvent,
  leaveEvent,
  getUserEvents,
  getJoinedEvents,
} = require("../controllers/eventController")
const auth = require("../middleware/auth")

const router = express.Router()

// Public routes
router.get("/", getEvents)
router.get("/:id", getEvent)

// Protected routes
router.post("/", auth, createEvent)
router.post("/:id/join", auth, joinEvent)
router.post("/:id/leave", auth, leaveEvent)
router.get("/user/organized", auth, getUserEvents)
router.get("/user/joined", auth, getJoinedEvents)

module.exports = router
