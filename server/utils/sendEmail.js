import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendVerificationEmail(to, token) {
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
  console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Є" : "Немає");
  console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
  console.log("CLIENT_URL:", process.env.CLIENT_URL);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Підтвердження email",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Підтвердження email</h2>
          <p>Дякуємо за реєстрацію у City Events Map.</p>

          <p>
            <a href="${verifyUrl}"
              style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
              Підтвердити email
            </a>
          </p>

          <p>Якщо кнопка не працює:</p>
          <p>${verifyUrl}</p>
        </div>
      `,
    });

    console.log("EMAIL SENT:", info.response);
  } catch (error) {
    console.error("EMAIL SEND ERROR:", error);
    throw error;
  }
}
