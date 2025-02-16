import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

async function sendEmail() {
  const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 1025,
    secure: false,
  });

  await transporter.sendMail({
    from: '"Next.js Mailer" <no-reply@example.com>',
    to: "test@mail.com",
    subject: "Sending email with attachment",
    text: "This is a test email with an attachment.",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Email Template</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
          .header { background: #007bff; color: white; text-align: center; padding: 15px; font-size: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px; }
          .content { padding: 20px; line-height: 1.6; color: #333; }
          .footer { text-align: center; padding: 15px; font-size: 14px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class='container'>
          <div class='header'> 📩 New Message </div>
          <div class='content'>
            <p>Hi <strong>John Doe</strong>,</p>
            <p>You have received a new email in your inbox.</p>
            <p><strong>Subject:</strong> Welcome to Our Service</p>
            <p><strong>Message:</strong> Thank you for signing up! We are excited to have you on board.</p>
            <a href='#' class='button'>View Email</a>
          </div>
          <div class='footer'>
            <p>© 2025 YourCompany. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: "API_MerchantPay.pdf",
        path: path.join(process.cwd(), "attachments", "API_MerchantPay.pdf"),
        contentType: "application/pdf",
      },
    ],
  });

  console.log("Email sent with attachment!");
}

await sendEmail();
