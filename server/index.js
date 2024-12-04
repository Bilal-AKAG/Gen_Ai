import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { CohereClient } from "cohere-ai";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(join(__dirname, "../public")));

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
pool
  .getConnection()
  .then((connection) => {
    console.log("Database connected successfully");
    connection.release();
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

// Cohere AI setup
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.insertId, email },
      process.env.JWT_SECRET
    );

    res.json({
      token,
      user: { id: result.insertId, email },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id, email }, process.env.JWT_SECRET);

    res.json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
});

app.get("/api/auth/verify", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Chat routes
app.get("/api/chat/history", authenticateToken, async (req, res) => {
  try {
    const [messages] = await pool.execute(
      "SELECT content, is_user, created_at FROM messages WHERE user_id = ? ORDER BY created_at ASC",
      [req.user.id]
    );

    res.json(messages);
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

app.post("/api/chat/message", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;

    // Store user message
    await pool.execute(
      "INSERT INTO messages (user_id, content, is_user) VALUES (?, ?, true)",
      [req.user.id, message]
    );

    // Get AI response
    const response = await cohere.generate({
      prompt: message,
      maxTokens: 300,
      temperature: 0.7,
    });

    const aiResponse = response.generations[0].text.trim();

    // Store AI response
    await pool.execute(
      "INSERT INTO messages (user_id, content, is_user) VALUES (?, ?, false)",
      [req.user.id, aiResponse]
    );

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chat message error:", error);
    res.status(500).json({ message: "Error processing message" });
  }
});

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
