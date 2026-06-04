import express from "express";
import { signup, login, logout, updateProfile, checkAuth, forgotPassword, resetPassword, googleAuth } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup",signup);
router.post("/google", googleAuth);

router.post("/login",login);

router.post("/logout",logout);

router.put("/update-profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
export default router;