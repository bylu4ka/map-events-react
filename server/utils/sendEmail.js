import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(to, token) {
  const verifyUrl = `${process.env.SERVER_URL}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: "City Events Map <onboarding@resend.dev>",
    to,
    subject: "Підтвердження email",
    html: `
      <h2>Підтвердження email</h2>
      <p>Дякуємо за реєстрацію у City Events Map.</p>
      <a href="${verifyUrl}">Підтвердити email</a>
      <p>${verifyUrl}</p>
    `,
  });
}
