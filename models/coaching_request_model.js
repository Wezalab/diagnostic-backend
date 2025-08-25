const mongoose = require("mongoose");

const coachingRequestSchema = mongoose.Schema({
  coach: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  coachee: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    default: "Je souhaiterais bénéficier de votre accompagnement en coaching."
  },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 're-request'],
    default: 'pending'
  },
  responseMessage: { 
    type: String,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  respondedAt: { 
    type: Date,
    default: null
  },
  reRequestedAt: { 
    type: Date,
    default: null
  },
  // Additional fields for enhanced functionality
  sessionProposed: {
    type: Boolean,
    default: false
  },
  sessionDetails: {
    type: String,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Indexes for better query performance
coachingRequestSchema.index({ coach: 1, status: 1 });
coachingRequestSchema.index({ coachee: 1, status: 1 });
coachingRequestSchema.index({ createdAt: -1 });

// Prevent duplicate pending requests from same coachee to same coach
coachingRequestSchema.index(
  { coach: 1, coachee: 1, status: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 're-request'] } }
  }
);

const CoachingRequest = mongoose.model("CoachingRequest", coachingRequestSchema);
module.exports = CoachingRequest;
