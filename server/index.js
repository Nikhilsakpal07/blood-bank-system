const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { predictDemand } = require('./aiEngine');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Database Connection Check
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL database!');
  release();
});

// --- AUTHENTICATION ROUTES ---

// Register a new Admin User
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const newUser = await pool.query(
            "INSERT INTO Users (email, password) VALUES($1, $2) RETURNING *",
            [email, password]
        );
        res.json(newUser.rows[0]);
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(400).send("User already exists or database error");
    }
});

// Login Admin User
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
        
        if (user.rows.length > 0 && user.rows[0].password === password) {
            res.json({ success: true, user: user.rows[0] });
        } else {
            res.status(401).send("Invalid Credentials");
        }
    } catch (err) { 
        res.status(500).send(err.message); 
    }
});

// --- PRIVATE DATA ROUTES (Owner-Specific) ---

// GET: Filtered Donors for the logged-in user
app.get('/donors', async (req, res) => {
    try {
        const { userId } = req.query; 
        if (!userId) return res.status(400).send("User ID required");

        const allDonors = await pool.query(`
            SELECT * FROM Donor 
            WHERE owner_id = $1 
            ORDER BY d_id DESC
        `, [userId]);
        
        res.json(allDonors.rows);
    } catch (err) {
        console.error("Fetch Error:", err.message);
        res.status(500).send("Server Error");
    }
});

// POST: Register a new donor linked to the owner_id
app.post('/donors', async (req, res) => {
    // Start a client from the pool to handle a Transaction
    const client = await pool.connect();
    
    try {
        const { 
            name, age, gender, blood_group, contact_no, 
            major_illness, medical_eligibility, owner_id 
        } = req.body;

        if (!owner_id) return res.status(400).send("User ID is required for multi-tenancy.");

        await client.query('BEGIN'); // Start Transaction

        // 1. Check for duplicates ONLY for this specific owner
        const check = await client.query(
            "SELECT * FROM Donor WHERE contact_no = $1 AND owner_id = $2", 
            [contact_no, owner_id]
        );
        
        if (check.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).send("This phone number is already in your donor records.");
        }

        const finalIllness = (major_illness && major_illness.trim() !== "") ? major_illness : "None";

        // 2. Insert the New Donor
        const donorResult = await client.query(
            `INSERT INTO Donor 
            (name, age, gender, blood_group, contact_no, major_illness, medical_eligibility, last_donation_date, owner_id) 
            VALUES($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8) RETURNING *`,
            [name, age, gender, blood_group, contact_no, finalIllness, medical_eligibility, owner_id]
        );

        // 3. UPSERT into Blood_Bank (The "Sync" Logic)
        // This ensures the stock cards on the dashboard update immediately for this user
        await client.query(`
            INSERT INTO Blood_Bank (blood_group, total_units, owner_id, expiry_date)
            VALUES ($1, 1, $2, CURRENT_DATE + INTERVAL '35 days')
            ON CONFLICT (blood_group, owner_id) 
            DO UPDATE SET total_units = Blood_Bank.total_units + 1
        `, [blood_group, owner_id]);

        await client.query('COMMIT'); // Commit all changes
        res.json(donorResult.rows[0]);

    } catch (err) {
        await client.query('ROLLBACK'); // Undo everything if an error occurs
        console.error("Postgres Transaction Error:", err.message);
        res.status(500).send("Server Error: " + err.message);
    } finally {
        client.release(); // Close the database connection
    }
});

// GET: Inventory summary (Stock Cards) filtered by user
app.get("/inventory/summary", async (req, res) => {
    try {
        const { userId } = req.query;
        const result = await pool.query(
            "SELECT blood_group, SUM(units) as total_units FROM Blood_Bank WHERE owner_id = $1 GROUP BY blood_group ORDER BY blood_group ASC",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// GET: Analytics Data (Chart) filtered by user
app.get("/analytics/donations", async (req, res) => {
    try {
        const { userId } = req.query;
        const result = await pool.query(
            "SELECT blood_group, count(*) as count FROM Donor WHERE owner_id = $1 GROUP BY blood_group",
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// POST: Record a dispatch linked to user
// POST: Record a dispatch linked to user
app.post("/dispatch", async (req, res) => {
  try {
    // CHANGE: Destructure 'userId' instead of 'owner_id' to match your Frontend
    const { h_id, blood_group, units_given, userId } = req.body; 
    
    // Check if stock exists before dispatching
    const newDispatch = await pool.query(
      "INSERT INTO Hospital_Dispatch (h_id, blood_group, units_given, owner_id) VALUES($1, $2, $3, $4) RETURNING *",
      [h_id, blood_group, units_given, userId] // Use 'userId' here
    );
    
    // IMPORTANT: You should also decrease the units in Blood_Bank here!
    await pool.query(
      "UPDATE Blood_Bank SET total_units = total_units - $1 WHERE blood_group = $2 AND owner_id = $3",
      [units_given, blood_group, userId]
    );

    res.json(newDispatch.rows[0]);
  } catch (err) {
    console.error("Dispatch Error:", err.message);
    res.status(400).json({ message: "Stock Update Failed: " + err.message });
  }
});

// --- UTILITY ROUTES ---

// Get all hospitals for the dropdown (Global list)
app.get("/hospitals", async (req, res) => {
  try {
    const allHospitals = await pool.query("SELECT * FROM Hospital");
    res.json(allHospitals.rows);
  } catch (err) {
    res.status(500).send("Database error");
  }
});

// AI Prediction (Uses history from the specific user)
app.get("/api/ai/predict-demand", async (req, res) => {
    try {
        const { userId } = req.query;
        const history = await pool.query(
            "SELECT blood_group, units_given, dispatch_date FROM Hospital_Dispatch WHERE owner_id = $1",
            [userId]
        );
        
        if (history.rows.length < 5) {
            return res.json({ message: "Need more data (min 5 dispatches) for your account." });
        }

        const prediction = predictDemand(history.rows);
        res.json(prediction);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Delete a donor
app.delete('/donors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM Donor WHERE d_id = $1", [id]);
    res.json("Donor was deleted successfully!");
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`RaktaSetu Server running on port ${PORT}`);
});