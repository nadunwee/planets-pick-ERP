// models/employeeModel.js
const mongoose = require("mongoose");
const validator = require("validator");

const Schema = mongoose.Schema;

const employeeSchema = new Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Invalid email address"],
    },
    phone: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },

    // Employment Details
    shift: {
      type: String,
      required: true,
    },
    contractType: {
      type: String,
      required: true,
    },
    workLocation: {
      type: String,
      default: "Head Office",
    },
    workingHours: {
      type: Number,
      default: 40, // per week
    },
    overtimeEligible: {
      type: Boolean,
      default: false,
    },

    // Additional Information
    emergencyContact: {
      type: String,
    },
    address: {
      type: String,
    },
    skills: {
      type: [String], // stored as array after splitting by commas
      default: [],
    },
    benefits: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },

    // User Account Information
    hasUserAccount: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Middleware: clean up skills/benefits/certifications
employeeSchema.pre("save", function (next) {
  if (typeof this.skills === "string") {
    this.skills = this.skills.split(",").map((s) => s.trim());
  }
  if (typeof this.benefits === "string") {
    this.benefits = this.benefits.split(",").map((s) => s.trim());
  }
  if (typeof this.certifications === "string") {
    this.certifications = this.certifications.split(",").map((s) => s.trim());
  }
  next();
});

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
