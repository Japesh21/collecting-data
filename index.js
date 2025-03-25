require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { body, validationResult } = require("express-validator");

const app = express();

// ✅ Allow CORS for frontend communication
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(bodyParser.json());

// ✅ Serve frontend files from "frontend" folder
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// ✅ Apply Rate Limiting (100 requests per 15 min per IP)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: "❌ Too many requests, please try again later."
});
app.use(limiter);

// ✅ MySQL Database Connection (Using Environment Variables)
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("❌ MySQL Connection Error:", err);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});

// ✅ Middleware to Check API Key (Optional for now)
function authenticate(req, res, next) {
    const userApiKey = req.headers["x-api-key"];
    if (process.env.API_KEY && userApiKey !== process.env.API_KEY) {
        return res.status(403).json({ message: "❌ Unauthorized - Invalid API Key" });
    }
    next();
}

// ✅ API to Submit Data
app.post("/submit",
    authenticate, 
    [
        body("name").isString().notEmpty(),
        body("rollno").isNumeric(),
        body("city").isString().notEmpty(),
        body("info").isString()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, rollno, city, info } = req.body;
        const sql = "INSERT INTO patients (name, rollno, city, info) VALUES (?, ?, ?, ?)";
        db.query(sql, [name, rollno, city, info], (err, result) => {
            if (err) {
                console.error("❌ Insert Error:", err);
                res.status(500).json({ message: "Database error!" });
            } else {
                res.json({ message: "✅ Data submitted successfully!" });
            }
        });
    }
);

// ✅ API to Get Data
app.get("/data", authenticate, (req, res) => {
    const sql = "SELECT * FROM patients";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Fetch Error:", err);
            res.status(500).json({ message: "Database error!" });
        } else {
            res.json(results);
        }
    });
});

// ✅ Enforce HTTPS (For Production)
app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https" && process.env.NODE_ENV === "production") {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
