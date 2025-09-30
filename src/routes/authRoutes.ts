import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();

// POST /api/v2/auth/login
router.post("/login", (req, res) => {
const { username, password } = req.body;
 // mock user
 if (username === "user4@abc.com" && password === "5678") {
   const token = jwt.sign(
     { username, role: "ADMIN", studentId: null },
     process.env.JWT_SECRET || "this_is_my_secret",
     { expiresIn: "1h" }
   );

   return res.json({
     success: true,
     token,
   });
 }

 return res.status(401).json({
   success: false,
   message: "Invalid credentials",
 });
});

export default router;