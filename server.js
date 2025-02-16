import { PrismaClient } from "@prisma/client";
import { createServer } from "http";
import { simpleParser } from "mailparser";
import { writeFileSync } from "node:fs";
import path from "node:path";

import next from "next";
import { SMTPServer } from "smtp-server";
import { Server } from "socket.io";
import { parse } from "url";
import { eventEmitter } from "./lib/event.js";

const port = parseInt(process.env.PORT || "1080", 10);
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const app = next({ dev });
const handle = app.getRequestHandler();

const prisma = new PrismaClient();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected ::", socket.id);
  });

  eventEmitter.on("message", (data) => {
    io.emit("message", data);
  });

  // Initialize SMTP Server
  const smtpServer = new SMTPServer({
    authOptional: true,
    secure: false,
    disabledCommands: ["STARTTLS"],
    onData(stream, session, callback) {
      let rawEmail = "";
      stream.on("data", (chunk) => {
        rawEmail += chunk.toString();
      });
      stream.on("end", () => {
        simpleParser(rawEmail, {})
          .then(async (parsedEmail) => {
            const emailData = {
              raw: rawEmail,
              from: parsedEmail.from?.text || "",
              to: parsedEmail.to?.text || "",
              date: parsedEmail.date || new Date().toISOString(),
              subject: parsedEmail.subject || "(No Subject)",
              text: parsedEmail.text || "",
              html: parsedEmail.html || "",
              headers: parsedEmail.headers,
              attachments: parsedEmail.attachments,
            };
            const email = await prisma.email.create({
              data: {
                to: emailData.to,
                from: emailData.from,
                subject: emailData.subject,
                text: emailData.text,
                html: emailData.html,
                raw: rawEmail,
                headers: JSON.stringify(emailData.headers),
              },
            });

            await Promise.all(
              emailData.attachments.map(async (file) => {
                const buffer = Buffer.from(file.content);
                const filename = `/attachments/file${file.checksum}_${file.filename}`;
                const filePath = path.join(process.cwd(), "public", filename);
                writeFileSync(filePath, buffer);
                return await prisma.attachment.create({
                  data: {
                    fileName: file.filename,
                    fileType: file.contentType,
                    fileUrl: filename,
                    emailId: email.id,
                  },
                });
              })
            );
            eventEmitter.emit("message", email);
          })
          .catch((err) => console.error("Error parsing email:", err));
      });
      callback(null);
    },
  });

  smtpServer.listen(1025, () => {
    console.log("> SMTP Server running on port 1025");
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Ready on http://${hostname}:${port} as ${
          dev ? "development" : process.env.NODE_ENV
        }`
      );
    });
});
