const mongoose = require("mongoose");

/**
 * Employee Schema
 * Stores all employee details. QR code is generated on the frontend
 * using only the empId field, ensuring the QR never changes even if
 * other details are updated.
 */
const employeeSchema = new mongoose.Schema(
  {
    // Unique employee identifier — used as QR payload
    empId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },

    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },

    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },

    // Optional base64 photo or URL
    photo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
