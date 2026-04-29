const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const { protect } = require("../middleware/authMiddleware");

/**
 * POST /api/employees/add
 * Add a new employee. Protected route (admin only).
 */
router.post("/add", protect, async (req, res) => {
  try {
    const { empId, name, email, phone, department, designation, joiningDate, photo } = req.body;

    // Check if empId or email already exists
    const existing = await Employee.findOne({ $or: [{ empId }, { email }] });
    if (existing) {
      return res.status(400).json({
        message: existing.empId === empId
          ? "Employee ID already exists"
          : "Email already registered",
      });
    }

    const employee = new Employee({
      empId,
      name,
      email,
      phone,
      department,
      designation,
      joiningDate,
      photo: photo || "",
    });

    await employee.save();
    res.status(201).json({ message: "Employee added successfully", employee });
  } catch (error) {
    console.error("Add employee error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET /api/employees
 * Fetch all employees with optional search by name, empId, or department.
 * Supports pagination via ?page=1&limit=10
 * Protected route.
 */
router.get("/", protect, async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build search filter
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { empId: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } },
            { designation: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await Employee.countDocuments(filter);
    const employees = await Employee.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * GET /api/employees/:empId
 * Fetch a single employee by their empId.
 * PUBLIC route — used by QR scanner to show profile card.
 */
router.get("/:empId", async (req, res) => {
  try {
    const employee = await Employee.findOne({ empId: req.params.empId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(employee);
  } catch (error) {
    console.error("Get employee error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * PUT /api/employees/update/:id
 * Update employee details by MongoDB _id.
 * empId is NOT allowed to change (QR permanence).
 * Protected route.
 */
router.put("/update/:id", protect, async (req, res) => {
  try {
    const { empId, ...updateData } = req.body; // strip empId from updates

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee updated successfully", employee });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * DELETE /api/employees/:id
 * Delete an employee by MongoDB _id.
 * Protected route.
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
