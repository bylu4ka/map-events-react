import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(to, token) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Підтвердження email",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Підтвердження email</h2>
        <p>Дякуємо за реєстрацію у City Events Map.</p>
        <p>Щоб завершити реєстрацію, натисни кнопку нижче:</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
            Підтвердити email
          </a>
        </p>
        <p>Якщо кнопка не працює, відкрий це посилання вручну:</p>
        <p>${verifyUrl}</p>
      </div>
    `,
  });
}
