import { NextResponse } from "next/server";
const { getDB, getLocalDateTimeString } = require("../../../database/db");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

function ensurePasswordResetsTable(db) {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        token VARCHAR(128) NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )`,
      (err) => (err ? reject(err) : resolve())
    );
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email && String(body.email).trim();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = getDB();
    await ensurePasswordResetsTable(db);

    // Find user by email (if exists)
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT id, email FROM users WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });

    // Always return success to avoid user enumeration
    if (user) {
      const token = crypto.randomBytes(24).toString("hex");
      const createdAt = getLocalDateTimeString();
      await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO password_resets (user_id, token, created_at) VALUES (?, ?, ?)",
          [user.id, token, createdAt],
          (err) => (err ? reject(err) : resolve())
        );
      });

      // Send email with reset link if SMTP configured
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const resetLink = `${appUrl}/reset-password/${token}`;

      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpHost && smtpPort && smtpUser && smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465, // true for 465, false for other ports
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          const mail = {
            from: process.env.SMTP_FROM || smtpUser,
            to: user.email,
            subject: "AGF Password Reset",
            text: `You requested a password reset. Open the following link to reset your password:\n\n${resetLink}\n\nIf you didn't request this, ignore this message.`,
            html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you didn't request this, ignore this message.</p>`,
          };

          await transporter.sendMail(mail);
          console.log(`[forgot-password] sent reset email to ${user.email}`);
        } catch (err) {
          console.error("Failed to send reset email:", err);
        }
      } else {
        // If no SMTP configured, send using Ethereal test account for local development
        try {
          const testAccount = await nodemailer.createTestAccount();
          const transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });

          const mail = {
            from: process.env.SMTP_FROM || testAccount.user,
            to: user.email,
            subject: "AGF Password Reset (Test)",
            text: `You requested a password reset. Open the following link to reset your password:\n\n${resetLink}\n\nIf you didn't request this, ignore this message.`,
            html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you didn't request this, ignore this message.</p>`,
          };

          const info = await transporter.sendMail(mail);
          const preview = nodemailer.getTestMessageUrl(info);
          console.log(`[forgot-password] Ethereal preview URL: ${preview}`);
        } catch (err) {
          console.warn("SMTP not configured; reset link:", resetLink);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
