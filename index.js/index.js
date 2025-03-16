const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Change if your MySQL username is different
    password: "1515", // Add your MySQL password if you have one
    database: "hospitalDB"
});

db.connect(err => {
    if (err) {
        console.error("❌ MySQL Connection Error:", err);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});

// API to Submit Data
app.post("/submit", (req, res) => {
    const { name, rollno, city, info } = req.body;
    const sql = "INSERT INTO patients (name, rollno, city, info) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, rollno, city, info], (err, result) => {
        if (err) {
            console.error("❌ Insert Error:", err);
            res.status(500).json({ message: "Database error!" });
        } else {
            res.json({ message: "Data submitted successfully!" });
        }
    });
});

// API to Get Data
app.get("/data", (req, res) => {
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
