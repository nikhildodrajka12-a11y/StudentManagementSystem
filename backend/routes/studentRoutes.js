
const express = require("express");
const mongoose = require("mongoose");
const Student = require("../models/Student");

const router = express.Router();

// READ: Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch students." });
  }
});

// CREATE: Add a student
router.post("/", async (req, res) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    if (
      !studentId?.trim() ||
      !name?.trim() ||
      !email?.trim() ||
      !department?.trim() ||
      semester === undefined ||
      semester === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const student = await Student.create({
      studentId,
      name,
      email,
      department,
      semester,
      contact,
    });

    res.status(201).json({
      success: true,
      message: "Student added successfully.",
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Student ID already exists.",
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid student details.",
      });
    }

    res.status(500).json({ success: false, message: "Could not add student." });
  }
});

// READ: Get one student by MongoDB document ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student record ID." });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not fetch student." });
  }
});

// UPDATE: Edit a student
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student record ID." });
    }

    const allowed = ["studentId", "name", "email", "department", "semester", "contact"];
    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    res.json({ success: true, message: "Student updated successfully.", data: student });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Student ID already exists." });
    }

    res.status(400).json({ success: false, message: "Could not update student details." });
  }
});

// DELETE: Remove a student
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid student record ID." });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    res.json({ success: true, message: "Student deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Could not delete student." });
  }
});

module.exports = router;
