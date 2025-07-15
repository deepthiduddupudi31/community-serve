const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "community-service",
        "environmental",
        "education",
        "healthcare",
        "social-welfare",
        "disaster-relief",
        "other",
      ],
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      address: {
        type: String,
        required: function () {
          return !this.isVirtual
        },
      },
      city: {
        type: String,
        required: function () {
          return !this.isVirtual
        },
      },
      state: {
        type: String,
        required: function () {
          return !this.isVirtual
        },
      },
      zipCode: {
        type: String,
        required: function () {
          return !this.isVirtual
        },
      },
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    maxParticipants: {
      type: Number,
      min: 1,
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    requirements: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
    },
    isVirtual: {
      type: Boolean,
      default: false,
    },
    virtualLink: {
      type: String,
      required: function () {
        return this.isVirtual
      },
    },
  },
  {
    timestamps: true,
  },
)

eventSchema.index({ date: 1 })
eventSchema.index({ category: 1 })
eventSchema.index({ organizer: 1 })
eventSchema.index({ status: 1 })
eventSchema.index({ tags: 1 })

module.exports = mongoose.model("Event", eventSchema)
