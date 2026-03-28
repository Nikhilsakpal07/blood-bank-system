const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { predictDemand } = require('./aiEngine');

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- 2. AUTO-CREATE TABLES ON STARTUP ---
// Using lowercase names to ensure compatibility with Render PostgreSQL
const createTables = async () => {
    try {
        // 1. Create Users first (The main Owner)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `);

        // 2. Create Hospitals (Depends on users)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS hospitals (
                h_id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                address TEXT,
                contact_no VARCHAR(20),
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // 3. Create Donors (Depends on users)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS donors (
                d_id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                age INTEGER,
                gender VARCHAR(10),
                blood_group VARCHAR(5),
                contact_no VARCHAR(20),
                medical_eligibility VARCHAR(10),
                major_illness TEXT,
                last_donation_date DATE DEFAULT CURRENT_DATE,
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // 4. Create Dispatch (Depends on hospitals AND users)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS dispatch (
                id SERIAL PRIMARY KEY,
                h_id INTEGER REFERENCES hospitals(h_id) ON DELETE CASCADE,
                blood_group VARCHAR(5),
                units_given INTEGER,
                dispatch_date DATE DEFAULT CURRENT_DATE,
                purpose VARCHAR(50),
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        console.log("✅ All tables initialized in correct sequence!");
    } catch (err) {
        console.error("❌ Error creating tables:", err);
    }
};
createTables();

// --- 3. AUTHENTICATION ROUTES ---

// Register Admin
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Added 'name' to the insert to prevent NOT NULL errors
        // We'll use the email prefix as a temporary name
        const tempName = email.split('@')[0]; 

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password) VALUES($1, $2, $3) RETURNING *",
            [tempName, email, password]
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error("Register Error:", err.message);
        // This is the error you are seeing!
        res.status(400).send("User already exists or database error");
    }
});
app.post('/hospitals', async (req, res) => {
    try {
        const { name, address, contact, userId } = req.body;
        const newHosp = await pool.query(
            "INSERT INTO hospitals (name, address, contact_no, owner_id) VALUES($1, $2, $3, $4) RETURNING *",
            [name, address, contact, userId]
        );
        res.json(newHosp.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});
// server/index.js
app.get('/hospitals', async (req, res) => {
    try {
        const { userId } = req.query; // This comes from your frontend axios call
        const userHospitals = await pool.query(
            "SELECT * FROM hospitals WHERE owner_id = $1", 
            [userId]
        );
        res.json(userHospitals.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Database Error");
    }
});
// Login Admin
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // FIX: lowercase 'users'
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (user.rows.length > 0 && user.rows[0].password === password) {
            res.json({ success: true, user: user.rows[0] });
        } else {
            res.status(401).send("Invalid Credentials");
        }
    } catch (err) { 
        res.status(500).send(err.message); 
    }
});

// --- 4. DATA ROUTES ---

app.get('/donors', async (req, res) => {
    try {
        const { userId } = req.query; 
        if (!userId) return res.status(400).send("User ID required");

        const allDonors = await pool.query(
            "SELECT * FROM donor WHERE owner_id = $1 ORDER BY d_id DESC", 
            [userId]
        );
        res.json(allDonors.rows);
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

app.post('/donors', async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, age, gender, blood_group, contact_no, major_illness, medical_eligibility, owner_id } = req.body;
        if (!owner_id) return res.status(400).send("User ID is required");

        await client.query('BEGIN');
        const finalIllness = (major_illness && major_illness.trim() !== "") ? major_illness : "None";

        const donorResult = await client.query(
            `INSERT INTO donor (name, age, gender, blood_group, contact_no, major_illness, medical_eligibility, last_donation_date, owner_id) 
            VALUES($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8) RETURNING *`,
            [name, age, gender, blood_group, contact_no, finalIllness, medical_eligibility, owner_id]
        );

        await client.query(`
            INSERT INTO blood_bank (blood_group, total_units, owner_id, expiry_date)
            VALUES ($1, 1, $2, CURRENT_DATE + INTERVAL '35 days')
            ON CONFLICT (blood_group, owner_id) 
            DO UPDATE SET total_units = blood_bank.total_units + 1
        `, [blood_group, owner_id]);

        await client.query('COMMIT');
        res.json(donorResult.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).send(err.message);
    } finally {
        client.release();
    }
});

app.get("/inventory/summary", async (req, res) => {
    try {
        const { userId } = req.query;
        const result = await pool.query(
            "SELECT blood_group, total_units FROM blood_bank WHERE owner_id = $1 ORDER BY blood_group ASC",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- 5. START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 RaktaSetu Server running on port ${PORT}`);
});