import express from "express";
import cors from "cors";
import "dotenv/config";
import { Resend } from "resend";

// Routes files backend folder-la illadha varaikkum comment panni vachukalam
// import instagramRoutes from "./routes/instagram.js";
// import facebookRoutes from "./routes/facebook.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Resend initialization (Uses key from .env)
const resend = new Resend(process.env.RESEND_API_KEY);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://raadheysilvers.in",
  "https://www.raadheysilvers.in",
  "https://raadhey-silver.netlify.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

// CORS Configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (Postman / mobile apps / server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      console.log("Blocked CORS origin:", origin);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ROOT ROUTE
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Raadhey Silvers Backend is running",
  });
});

// HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend healthy",
  });
});

// CONTACT ENQUIRY ROUTE
app.post("/api/contact", async (req, res) => {
  const { name, phone, email, interest, message } = req.body;

  // Validation Check
  if (!name || !phone || !email || !interest || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const data = await resend.emails.send({
      // Verified custom domain sender
      from: `${name} <contact@raadheysilvers.in>`,
      to: ["contact@raadheysilvers.in"],
      replyTo: email, // CamelCase for Resend SDK
      subject: `💎 New Jewellery Enquiry: ${name} (${interest})`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2D1457; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E9E5FF; border-radius: 16px; background-color: #FAF8FF;">
          <div style="border-bottom: 2px solid #8B5CF6; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #4A2F8C; margin: 0; font-size: 22px;">New Customer Enquiry</h2>
            <p style="color: #78716C; margin: 5px 0 0 0; font-size: 13px;">Raadhey Silvers - Enquiry Form</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #4A2F8C; width: 140px;">Customer Name:</td>
              <td style="padding: 10px 0; color: #1C1917;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #4A2F8C;">Phone Number:</td>
              <td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #6D4CFF; text-decoration: none; font-weight: bold;">${phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #4A2F8C;">Email Address:</td>
              <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #6D4CFF; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #4A2F8C;">Interested In:</td>
              <td style="padding: 10px 0;"><span style="background: #EFE9FE; color: #4A2F8C; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 13px;">${interest}</span></td>
            </tr>
          </table>

          <div style="margin-top: 20px;">
            <p style="font-weight: bold; color: #4A2F8C; margin-bottom: 8px; font-size: 14px;">Requirement / Message:</p>
            <div style="background: #ffffff; padding: 14px; border-radius: 10px; border: 1px solid #E5E1FF; color: #332A42; font-size: 14px; white-space: pre-wrap;">${message}</div>
          </div>

          <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #E5E1FF; text-align: center;">
            <p style="font-size: 12px; color: #9CA3AF; margin: 0;">This enquiry was submitted via raadheysilvers.in contact form.</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Enquiry email sent successfully",
      data,
    });
  } catch (error) {
    console.error("Resend API Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send email",
    });
  }
});

// 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// START SERVER (Local-la mattum run aagum, Vercel-la conflict varaadhu)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

// VERCEL SERVERLESS EXPORT
export default app;