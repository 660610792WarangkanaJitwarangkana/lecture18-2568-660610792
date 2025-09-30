// src/routes/enrollmentsRoutes.ts
import { Router, type Request, type Response } from "express";
import { authenticateToken } from "../middlewares/authenMiddleware.js";
import { checkRoleAdmin } from "../middlewares/checkRoleAdminMiddleware.js";
import { checkRoles } from "../middlewares/checkRolesMiddleware.js";


import { enrollments, reset_enrollments } from "../db/db.js";
import type { CustomRequest, Enrollment } from "../libs/types.js";

const router = Router();

/**
 * 1. ADMIN only
 */

// GET /api/v2/enrollments → แสดงข้อมูลทั้งหมด
router.get("/", authenticateToken, checkRoleAdmin, (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: enrollments,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err,
    });
  }
});

// POST /api/v2/enrollments/reset → reset enrollment data
router.post("/reset", authenticateToken, checkRoleAdmin, (req: Request, res: Response) => {
  try {
    reset_enrollments();
    return res.json({
      success: true,
      message: "Enrollments have been reset",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err,
    });
  }
});

/**
 * 2. ADMIN + STUDENT
 */

// GET /api/v2/enrollments/:studentId
router.get("/:studentId", authenticateToken, checkRoles, (req: Request, res: Response) => {
  try {
    const payload = (req as CustomRequest).user;
    const { studentId } = req.params;

    // ถ้าเป็น STUDENT ต้องดูได้เฉพาะของตัวเอง
    if (payload?.role === "STUDENT" && payload?.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden access",
      });
    }

    const data = enrollments.filter((e: Enrollment) => e.studentId === studentId);
    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err,
    });
  }
});

/**
 * 3. STUDENT only
 */

// POST /api/v2/enrollments/:studentId → add enrollment
// POST /api/v2/enrollments/:studentId → add enrollment
router.post("/:studentId", authenticateToken, checkRoles, (req: Request, res: Response) => {
  try {
    const payload = (req as CustomRequest).user;
    const { studentId } = req.params;
    const { courseId } = req.body;

    if (!studentId || typeof studentId !== "string") {
      return res.status(400).json({
        success: false,
        message: "studentId (string) is required",
      });
    }

    if (!courseId || typeof courseId !== "string") {
      return res.status(400).json({
        success: false,
        message: "courseId (string) is required",
      });
    }

    if (payload?.role !== "STUDENT" || payload?.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    const exists = enrollments.find(
      (e: Enrollment) => e.studentId === studentId && e.courseId === courseId
    );
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course",
      });
    }

    enrollments.push({ studentId, courseId });
    return res.json({
      success: true,
      message: "Enrolled successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err,
    });
  }
});


// DELETE /api/v2/enrollments/:studentId → drop enrollment
router.delete("/:studentId", authenticateToken, checkRoles, (req: Request, res: Response) => {
  try {
    const payload = (req as CustomRequest).user;
    const { studentId } = req.params;
    const { courseId } = req.body;

    if (!courseId || typeof courseId !== "string") {
      return res.status(400).json({
        success: false,
        message: "courseId (string) is required",
      });
    }

    if (payload?.role !== "STUDENT" || payload?.studentId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Not allowed",
      });
    }

    const index = enrollments.findIndex(
      (e: Enrollment) => e.studentId === studentId && e.courseId === courseId
    );
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Course not found in enrollments",
      });
    }

    enrollments.splice(index, 1);
    return res.json({
      success: true,
      message: "Dropped successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err,
    });
  }
});

export default router;
