import { Socket } from "node:net";
import net from "node:net";
import tls from "node:tls";
import { env } from "../../config/env.js";

// For a no-.env demo setup, put the Gmail address and app password here.
// Do not commit a real app password to a public repository.
const HARDCODED_GMAIL_ADDRESS = "jeancalvin027@gmail.com";
const HARDCODED_GMAIL_APP_PASSWORD = "hujp krqe zqyy oblq";

const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 587;

type MailInput = {
  to: string;
  subject: string;
  text: string;
};

function gmailAddress() {
  return process.env.GMAIL_ADDRESS || HARDCODED_GMAIL_ADDRESS;
}

function gmailAppPassword() {
  return process.env.GMAIL_APP_PASSWORD || HARDCODED_GMAIL_APP_PASSWORD;
}

function isConfigured() {
  return Boolean(gmailAddress() && gmailAppPassword());
}

function sanitizeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function dotStuff(value: string) {
  return value.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
}

function waitForResponse(socket: Socket): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const last = lines.at(-1);
      if (last && /^\d{3} /.test(last)) {
        cleanup();
        resolve(buffer);
      }
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };
    socket.on("data", onData);
    socket.on("error", onError);
  });
}

async function command(socket: Socket, value: string, expected: number | number[]) {
  socket.write(`${value}\r\n`);
  const response = await waitForResponse(socket);
  const code = Number(response.slice(0, 3));
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(code)) {
    throw new Error(`SMTP command failed: ${response.trim()}`);
  }
}

async function sendViaGmail(input: MailInput) {
  const user = gmailAddress();
  const password = gmailAppPassword();
  let socket: Socket = net.connect({ host: SMTP_HOST, port: SMTP_PORT });

  await new Promise<void>((resolve, reject) => {
    socket.once("connect", resolve);
    socket.once("error", reject);
  });

  try {
    await waitForResponse(socket);
    await command(socket, "EHLO localhost", 250);
    await command(socket, "STARTTLS", 220);

    socket = tls.connect({ socket, servername: SMTP_HOST });
    await new Promise<void>((resolve, reject) => {
      socket.once("secureConnect", resolve);
      socket.once("error", reject);
    });

    await command(socket, "EHLO localhost", 250);
    await command(socket, `AUTH PLAIN ${Buffer.from(`\0${user}\0${password}`).toString("base64")}`, 235);
    await command(socket, `MAIL FROM:<${user}>`, 250);
    await command(socket, `RCPT TO:<${input.to}>`, [250, 251]);
    await command(socket, "DATA", 354);

    const message = [
      `From: ${sanitizeHeader(user)}`,
      `To: ${sanitizeHeader(input.to)}`,
      `Subject: ${sanitizeHeader(input.subject)}`,
      `Date: ${new Date().toUTCString()}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      dotStuff(input.text),
      "."
    ].join("\r\n");

    await command(socket, message, 250);
    await command(socket, "QUIT", 221);
  } finally {
    socket.end();
  }
}

export const emailService = {
  /** Sends email through Gmail SMTP when credentials are configured. */
  async send(input: MailInput): Promise<void> {
    if (!isConfigured()) {
      console.warn("Email delivery skipped because Gmail credentials are not configured.");
      return;
    }
    await sendViaGmail(input);
  },

  /** Sends the registration verification code to the pending user. */
  sendRegistrationOtp(email: string, otp: string, expiresInMinutes: number) {
    return this.send({
      to: email,
      subject: "TZW Fire Safety verification code",
      text: [
        "Your TZW Fire Safety verification code is:",
        "",
        otp,
        "",
        `This code expires in ${expiresInMinutes} minutes.`
      ].join("\n")
    });
  },

  /** Sends the password reset token and link to the user. */
  sendPasswordReset(email: string, token: string) {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    return this.send({
      to: email,
      subject: "TZW Fire Safety password reset",
      text: [
        "A password reset was requested for your TZW Fire Safety account.",
        "",
        `Reset link: ${resetUrl}`,
        "",
        `Reset token: ${token}`,
        "",
        "This token expires in 30 minutes. If you did not request this, ignore this email."
      ].join("\n")
    });
  }
};
