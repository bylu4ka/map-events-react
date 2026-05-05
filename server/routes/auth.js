import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

function formatUser(user) {
  return {
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
}

function createJwt(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: "Заповніть усі поля" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Пароль має містити мінімум 6 символів",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Користувач уже існує" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);

      return res.status(201).json({
        message:
          "Реєстрація успішна. Перевір пошту та підтвердь email.",
      });
    } catch (emailError) {
      console.error("EMAIL SEND ERROR:", emailError);

      return res.status(201).json({
        message:
          "Акаунт створено, але лист підтвердження не вдалося надіслати.",
      });
    }
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Помилка при реєстрації",
      error: error.message,
    });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(`${process.env.CLIENT_URL}/verify-error`);
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/verify-error`);
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    return res.redirect(`${process.env.CLIENT_URL}/verify-success`);
  } catch (error) {
    return res.redirect(`${process.env.CLIENT_URL}/verify-error`);
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "Користувача не знайдено" });
    }

    return res.json({ user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Помилка отримання профілю" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: "Заповніть усі поля" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Невірний email або пароль" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Невірний email або пароль" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Підтвердь email перед входом",
      });
    }

    const token = createJwt(user);

    return res.json({
      message: "Вхід успішний",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Помилка при вході" });
  }
});

router.get("/test", (req, res) => {
  res.json({ message: "auth routes work" });
});

export default router;
