



-- ==========================================
-- 1. INDEPENDENT TABLES (Parent Tables)
-- ==========================================

CREATE TABLE Blood_Bank (
    bloodbank_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    quantity INT,
    collection_date DATE,
    expiry_date DATE
);

CREATE TABLE Hospital (
    h_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(100),
    contact_no VARCHAR(15)
);

CREATE TABLE Donor (
    d_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    age INT,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    major_illness VARCHAR(100),
    medical_eligibility VARCHAR(10),
    contact_no VARCHAR(15)
);

-- ==========================================
-- 2. DEPENDENT TABLES (Child Tables)
-- ==========================================

-- Staff belongs to a Blood Bank (1:N)
CREATE TABLE Staff (
    s_id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    designation VARCHAR(50),
    contact_no VARCHAR(15),
    bloodbank_id INT,
    FOREIGN KEY (bloodbank_id) REFERENCES Blood_Bank(bloodbank_id) ON DELETE CASCADE
);

-- Donates links Donor and Blood Bank (M:N)
CREATE TABLE Donates (
    d_id INT,
    bloodbank_id INT,
    donation_date DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (d_id, bloodbank_id),
    FOREIGN KEY (d_id) REFERENCES Donor(d_id) ON DELETE CASCADE,
    FOREIGN KEY (bloodbank_id) REFERENCES Blood_Bank(bloodbank_id) ON DELETE CASCADE
);

-- Requests links Hospital and Blood Bank (M:N)
CREATE TABLE Requests (
    bloodbank_id INT,
    h_id INT,
    request_date DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (bloodbank_id, h_id),
    FOREIGN KEY (bloodbank_id) REFERENCES Blood_Bank(bloodbank_id) ON DELETE CASCADE,
    FOREIGN KEY (h_id) REFERENCES Hospital(h_id) ON DELETE CASCADE
);


-- ==========================================
-- 3. POPULATE DATA
-- ==========================================

-- Insert Blood Banks
INSERT INTO Blood_Bank (name, quantity, collection_date, expiry_date) VALUES 
('Jeevan Rakta Bank', 50, '2026-03-01', '2026-04-12'),
('City Central Blood Bank', 120, '2026-02-15', '2026-03-30'),
('Metropolis Blood Center', 85, '2026-03-10', '2026-04-22');

-- Insert Hospitals
INSERT INTO Hospital (name, address, contact_no) VALUES
('City Hospital', 'Wadala, Mumbai', '8000000001'),
('Lifeline Clinic', 'Shivaji Park', '8000000002'),
('Global Care', 'Andheri', '8000000003');

-- Insert Donors
INSERT INTO Donor (name, age, gender, blood_group, major_illness, medical_eligibility, contact_no) VALUES
('Nikhil Sakpal', 20, 'Male', 'O+', 'None', 'Yes', '9876543210'),
('Srushti Banugade', 21, 'Female', 'A+', 'None', 'Yes', '9123456780'),
('Rahul Mehta', 30, 'Male', 'B+', 'Diabetes', 'No', '9988776655');

-- Insert Staff (linked to Blood Bank IDs 1, 1, and 2)
INSERT INTO Staff (name, designation, contact_no, bloodbank_id) VALUES
('Rohan Kulkarni', 'Manager', '9000000001', 1),
('Neha Singh', 'Technician', '9000000002', 1),
('Vikas Rao', 'Assistant', '9000000003', 2);

-- Insert Relationships (Donations and Requests)
INSERT INTO Donates (d_id, bloodbank_id) VALUES (1, 1), (2, 1), (3, 2);
INSERT INTO Requests (bloodbank_id, h_id) VALUES (1, 1), (2, 2), (3, 3);

SELECT name, quantity, expiry_date FROM Blood_Bank;

SELECT Donor.name, Blood_Bank.name FROM Donor JOIN Donates ON Donor.d_id = Donates.d_id JOIN Blood_Bank ON Donates.bloodbank_id = Blood_Bank.bloodbank_id;

-- Add some stock so the cards have something to sum up
INSERT INTO Blood_Bank (name, quantity, collection_date, expiry_date) 
VALUES 
('Central Bank', 120, '2026-03-01', '2026-04-10'),
('Suburban Bank', 85, '2026-03-05', '2026-04-15')
ON CONFLICT (bloodbank_id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- This ensures there is stock data for the cards to display
INSERT INTO Blood_Bank (bloodbank_id, name, blood_group, quantity) 
VALUES 
(1, 'City Central', 'O+', 150),
(2, 'City Central', 'A+', 120),
(3, 'Jeevan Rakta', 'B+', 90)
ON CONFLICT (bloodbank_id) DO UPDATE SET quantity = EXCLUDED.quantity;


-- 1. Add the blood_group column to the Blood_Bank table
ALTER TABLE Blood_Bank ADD COLUMN blood_group VARCHAR(5);

-- 2. Update existing rows with blood groups so the cards have data
UPDATE Blood_Bank SET blood_group = 'O+' WHERE bloodbank_id = 1;
UPDATE Blood_Bank SET blood_group = 'A+' WHERE bloodbank_id = 2;
UPDATE Blood_Bank SET blood_group = 'B+' WHERE bloodbank_id = 3;

-- 3. Verify the data is there
SELECT blood_group, quantity FROM Blood_Bank;

-- Link your existing donors to a blood bank to generate an expiry status
INSERT INTO Donates (d_id, bloodbank_id, donation_date) 
VALUES 
(1, 1, CURRENT_DATE), 
(2, 2, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Update the Blood Bank dates so they show as "Stable"
UPDATE Blood_Bank SET expiry_date = CURRENT_DATE + INTERVAL '45 days' WHERE bloodbank_id IN (1, 2);

-- Link Donor 1 (Nikhil) to Blood Bank 1
-- Link Donor 2 (Srushti) to Blood Bank 2
INSERT INTO Donates (d_id, bloodbank_id) VALUES (1, 1), (2, 2)
ON CONFLICT DO NOTHING;

-- Ensure those Blood Banks have an expiry date in the future
UPDATE Blood_Bank SET expiry_date = '2026-05-20' WHERE bloodbank_id IN (1, 2);

-- 1. Link Nikhil (d_id: 1) to Jeevan Rakta (bloodbank_id: 1)
-- 2. Link Srushti (d_id: 2) to Jeevan Rakta (bloodbank_id: 1)
INSERT INTO Donates (d_id, bloodbank_id, donation_date) 
VALUES (1, 1, CURRENT_DATE), (2, 1, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- 3. Ensure the Blood Bank has a valid future expiry date
UPDATE Blood_Bank SET expiry_date = '2026-06-15' WHERE bloodbank_id = 1;

-- 1. Link Donor 1 (Nikhil) to Blood Bank 1
-- 2. Link Donor 2 (Srushti) to Blood Bank 1
INSERT INTO Donates (d_id, bloodbank_id, donation_date) 
VALUES (1, 1, CURRENT_DATE), (2, 1, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- 3. Ensure the Blood Bank has a future expiry date
UPDATE Blood_Bank SET expiry_date = '2026-06-25' WHERE bloodbank_id = 1;


-- 1. Ensure your Blood Bank actually has an expiry date
UPDATE Blood_Bank SET expiry_date = '2026-05-15' WHERE bloodbank_id = 1;

-- 2. Link your Donors to that Blood Bank
-- Check your d_id in the table. If Nikhil is 1 and Srushti is 2:
INSERT INTO Donates (d_id, bloodbank_id, donation_date) 
VALUES (1, 1, CURRENT_DATE), (2, 1, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- 3. Check if the link worked
SELECT Donor.name, Blood_Bank.expiry_date 
FROM Donor 
JOIN Donates ON Donor.d_id = Donates.d_id 
JOIN Blood_Bank ON Donates.bloodbank_id = Blood_Bank.bloodbank_id;



-- Link Donor 1 (Nikhil) to Blood Bank 1 (Jeevan Rakta)
INSERT INTO Donates (d_id, bloodbank_id, donation_date) VALUES (1, 1, CURRENT_DATE);

-- Link Donor 2 (Srushti) to Blood Bank 1
INSERT INTO Donates (d_id, bloodbank_id, donation_date) VALUES (2, 1, CURRENT_DATE);

-- Ensure Blood Bank 1 has a valid future date
UPDATE Blood_Bank SET expiry_date = '2026-06-30' WHERE bloodbank_id = 1;


-- Ensure there is a 'Master' stock entry for the code to link to
INSERT INTO Blood_Bank (bloodbank_id, name, blood_group, quantity, expiry_date)
VALUES (1, 'Jeevan Rakta Main', 'O+', 100, CURRENT_DATE + INTERVAL '90 days')
ON CONFLICT (bloodbank_id) DO UPDATE SET expiry_date = CURRENT_DATE + INTERVAL '90 days';


SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'blood_bank';

CREATE TABLE Hospital_Dispatch (
    dispatch_id SERIAL PRIMARY KEY,
    h_id INT REFERENCES Hospital(h_id) ON DELETE CASCADE,
    blood_group VARCHAR(5) NOT NULL,
    units_given INT NOT NULL CHECK (units_given > 0),
    dispatch_date DATE DEFAULT CURRENT_DATE,
    receiver_name VARCHAR(100) -- Person at the hospital who received it
);

CREATE OR REPLACE FUNCTION auto_increment_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Blood_Bank 
    SET quantity = quantity + 1 
    WHERE blood_group = (SELECT blood_group FROM Donor WHERE d_id = NEW.d_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_add_stock
AFTER INSERT ON Donates
FOR EACH ROW
EXECUTE FUNCTION auto_increment_stock();



CREATE OR REPLACE FUNCTION auto_deduct_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Subtract units
    UPDATE Blood_Bank 
    SET quantity = quantity - NEW.units_given 
    WHERE blood_group = NEW.blood_group;

    -- Safety check: prevent negative stock
    IF (SELECT quantity FROM Blood_Bank WHERE blood_group = NEW.blood_group) < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for group %!', NEW.blood_group;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_remove_stock
AFTER INSERT ON Hospital_Dispatch
FOR EACH ROW
EXECUTE FUNCTION auto_deduct_stock();

ALTER TABLE Hospital_Dispatch ADD COLUMN purpose VARCHAR(20) DEFAULT 'Normal';


SELECT * FROM Hospital;

-- 1. Add the column to track history
ALTER TABLE Donor ADD COLUMN last_donation_date DATE;

-- 2. Update existing donors to have a date (optional, for testing)
UPDATE Donor SET last_donation_date = '2026-01-10' WHERE d_id = 1;

-- Adding the missing attributes from your ER diagram
ALTER TABLE Donor 
ADD COLUMN gender VARCHAR(10),
ADD COLUMN major_illness VARCHAR(100),
ADD COLUMN medical_eligibility VARCHAR(10) DEFAULT 'Yes';

-- Ensure the contact_no is unique to prevent duplicates at the DB level
ALTER TABLE Donor ADD CONSTRAINT unique_contact UNIQUE (contact_no);

-- Check the actual data in the table
SELECT d_id, name, major_illness, medical_eligibility FROM Donor ORDER BY d_id DESC LIMIT 5;


-- First, ensure you have at least 2 hospitals to dispatch to
INSERT INTO Hospital (name, address, contact_no) 
VALUES 
('City General Hospital', 'Mumbai Central', '9876543210'),
('St. Jude Medical Center', 'Andheri West', '9123456789')
ON CONFLICT DO NOTHING;

-- Insert 10 Dispatch Records to train the AI
-- Pattern: Higher units for O+ and A- on specific days
INSERT INTO Hospital_Dispatch (h_id, blood_group, units_given, receiver_name, dispatch_date)
VALUES 
(1, 'O+', 12, 'Dr. Sharma', CURRENT_DATE - INTERVAL '10 days'),
(2, 'A-', 8, 'Nurse Joy', CURRENT_DATE - INTERVAL '9 days'),
(1, 'O+', 15, 'Dr. Sharma', CURRENT_DATE - INTERVAL '8 days'),
(2, 'B+', 5, 'Admin Raj', CURRENT_DATE - INTERVAL '7 days'),
(1, 'O+', 20, 'Dr. Sharma', CURRENT_DATE - INTERVAL '6 days'),
(2, 'A-', 10, 'Nurse Joy', CURRENT_DATE - INTERVAL '5 days'),
(1, 'AB+', 4, 'Dr. Patel', CURRENT_DATE - INTERVAL '4 days'),
(1, 'O+', 18, 'Dr. Sharma', CURRENT_DATE - INTERVAL '3 days'),
(2, 'A-', 12, 'Nurse Joy', CURRENT_DATE - INTERVAL '2 days'),
(1, 'O+', 22, 'Dr. Sharma', CURRENT_DATE - INTERVAL '1 day');


-- Adding 50 units for each major blood group to the inventory
INSERT INTO Blood_Bank (blood_group, total_units, expiry_date)
VALUES 
('O+', 50, CURRENT_DATE + INTERVAL '35 days'),
('A+', 50, CURRENT_DATE + INTERVAL '35 days'),
('B+', 50, CURRENT_DATE + INTERVAL '35 days'),
('AB+', 50, CURRENT_DATE + INTERVAL '35 days'),
('O-', 50, CURRENT_DATE + INTERVAL '35 days'),
('A-', 50, CURRENT_DATE + INTERVAL '35 days')
ON CONFLICT (blood_group) 
DO UPDATE SET total_units = Blood_Bank.total_units + 50;

SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'blood_bank';


-- 1. If the column is missing entirely, add it
ALTER TABLE Blood_Bank ADD COLUMN IF NOT EXISTS total_units INTEGER DEFAULT 0;

-- 2. If you named it 'units' instead of 'total_units', rename it
-- (Ignore this if you don't have a column named 'units')
-- ALTER TABLE Blood_Bank RENAME COLUMN units TO total_units;

-- 3. Now try the Insert again
INSERT INTO Blood_Bank (blood_group, total_units, expiry_date)
VALUES 
('O+', 50, CURRENT_DATE + INTERVAL '35 days'),
('A+', 50, CURRENT_DATE + INTERVAL '35 days'),
('B+', 50, CURRENT_DATE + INTERVAL '35 days'),
('AB+', 50, CURRENT_DATE + INTERVAL '35 days'),
('O-', 50, CURRENT_DATE + INTERVAL '35 days'),
('A-', 50, CURRENT_DATE + INTERVAL '35 days')
ON CONFLICT (blood_group) 
DO UPDATE SET total_units = Blood_Bank.total_units + EXCLUDED.total_units;


ALTER TABLE Blood_Bank ADD CONSTRAINT unique_blood_group UNIQUE (blood_group);



INSERT INTO blood_bank (name, blood_group, total_units, expiry_date)
VALUES 
('Main Branch', 'O+', 200, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'A+', 50, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'B+', 50, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'AB+', 50, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'O-', 50, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'A-', 50, CURRENT_DATE + INTERVAL '35 days')
ON CONFLICT (blood_group) 
DO UPDATE SET total_units = blood_bank.total_units + EXCLUDED.total_units;

-- 1. Ensure the hospital exists
INSERT INTO Hospital (name, address, contact_no) 
VALUES ('City General Hospital', 'Mumbai Central', '9876543210')
ON CONFLICT DO NOTHING;

-- 2. Add the history patterns
INSERT INTO Hospital_Dispatch (h_id, blood_group, units_given, receiver_name, dispatch_date)
VALUES 
(1, 'O+', 12, 'Dr. Sharma', CURRENT_DATE - INTERVAL '10 days'),
(1, 'A-', 8, 'Nurse Joy', CURRENT_DATE - INTERVAL '9 days'),
(1, 'O+', 15, 'Dr. Sharma', CURRENT_DATE - INTERVAL '8 days'),
(1, 'B+', 5, 'Admin Raj', CURRENT_DATE - INTERVAL '7 days'),
(1, 'O+', 20, 'Dr. Sharma', CURRENT_DATE - INTERVAL '6 days'),
(1, 'A-', 10, 'Nurse Joy', CURRENT_DATE - INTERVAL '5 days'),
(1, 'AB+', 4, 'Dr. Patel', CURRENT_DATE - INTERVAL '4 days'),
(1, 'O+', 18, 'Dr. Sharma', CURRENT_DATE - INTERVAL '3 days'),
(1, 'A-', 12, 'Nurse Joy', CURRENT_DATE - INTERVAL '2 days'),
(1, 'O+', 22, 'Dr. Sharma', CURRENT_DATE - INTERVAL '1 day');


INSERT INTO blood_bank (name, blood_group, total_units, expiry_date)
VALUES 
('Main Branch', 'O+', 100, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'A+', 100, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'B+', 100, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'AB+', 100, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'O-', 100, CURRENT_DATE + INTERVAL '35 days'),
('Main Branch', 'A-', 100, CURRENT_DATE + INTERVAL '35 days')
ON CONFLICT (blood_group) 
DO UPDATE SET total_units = blood_bank.total_units + 100;


SELECT blood_group, total_units FROM blood_bank;

-- 1. Delete the rows where blood_group is NULL
DELETE FROM blood_bank WHERE blood_group IS NULL;

-- 2. If you have duplicate rows for 'O+', 'A+', etc., merge them:
-- This keeps the row with the most units and deletes others
DELETE FROM blood_bank a USING blood_bank b 
WHERE a.ctid < b.ctid AND a.blood_group = b.blood_group;


CREATE OR REPLACE FUNCTION add_to_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE blood_bank 
    SET total_units = total_units + 1 
    WHERE blood_group = NEW.blood_group;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER donor_added
AFTER INSERT ON Donor
FOR EACH ROW
EXECUTE FUNCTION add_to_stock();


-- 1. Remove the empty/null rows that were causing the [null] errors
DELETE FROM blood_bank WHERE blood_group IS NULL OR name IS NULL;

-- 2. Merge duplicates so we only have ONE row per group
DELETE FROM blood_bank a USING blood_bank b 
WHERE a.bloodbank_id < b.bloodbank_id AND a.blood_group = b.blood_group;

-- 3. Make blood_group UNIQUE so the trigger always hits the right row
ALTER TABLE blood_bank ADD CONSTRAINT unique_bg UNIQUE (blood_group);\


CREATE OR REPLACE FUNCTION add_to_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- We use 'NEW.units' (assuming your donor table has a units column)
    -- If it doesn't, we'll just add 1
    UPDATE blood_bank 
    SET total_units = total_units + 1 
    WHERE blood_group = NEW.blood_group;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


SELECT blood_group, total_units FROM blood_bank ORDER BY blood_group;

SELECT blood_group, count(*) as total_units FROM donors GROUP BY blood_group;


SELECT blood_group, total_units 
FROM Blood_Bank 
WHERE blood_group IS NOT NULL 
ORDER BY blood_group ASC;

-- Step 1: Ensure a hospital exists to receive the blood
INSERT INTO Hospital (name, address, contact_no) 
VALUES ('City General Hospital', 'Wadala, Mumbai', '8000000001')
ON CONFLICT DO NOTHING;

-- Step 2: Add 10 dispatches from the last 10 days
-- Your trigger will automatically subtract these units from Blood_Bank
INSERT INTO Hospital_Dispatch (h_id, blood_group, units_given, receiver_name, dispatch_date)
VALUES 
(1, 'O+', 15, 'Dr. Sharma', CURRENT_DATE - INTERVAL '10 days'),
(1, 'A-', 10, 'Nurse Joy', CURRENT_DATE - INTERVAL '9 days'),
(1, 'O+', 18, 'Dr. Sharma', CURRENT_DATE - INTERVAL '8 days'),
(1, 'B+', 5, 'Admin Raj', CURRENT_DATE - INTERVAL '7 days'),
(1, 'O+', 22, 'Dr. Sharma', CURRENT_DATE - INTERVAL '6 days'),
(1, 'A-', 12, 'Nurse Joy', CURRENT_DATE - INTERVAL '5 days'),
(1, 'AB+', 4, 'Dr. Patel', CURRENT_DATE - INTERVAL '4 days'),
(1, 'O+', 20, 'Dr. Sharma', CURRENT_DATE - INTERVAL '3 days'),
(1, 'A-', 15, 'Nurse Joy', CURRENT_DATE - INTERVAL '2 days'),
(1, 'O+', 25, 'Dr. Sharma', CURRENT_DATE - INTERVAL '1 day');


-- Step 1: Ensure your primary hospital is ready
INSERT INTO Hospital (name, address, contact_no) 
VALUES ('City General Hospital', 'Wadala, Mumbai', '8000000001')
ON CONFLICT DO NOTHING;

-- Step 2: Insert 10 days of history
-- The AI will see: 10 -> 12 -> 15 -> 18 -> 22...
INSERT INTO Hospital_Dispatch (h_id, blood_group, units_given, receiver_name, dispatch_date)
VALUES 
(1, 'O+', 10, 'Dr. Sharma', CURRENT_DATE - INTERVAL '10 days'),
(1, 'A-', 5, 'Nurse Joy', CURRENT_DATE - INTERVAL '9 days'),
(1, 'O+', 12, 'Dr. Sharma', CURRENT_DATE - INTERVAL '8 days'),
(1, 'B+', 4, 'Admin Raj', CURRENT_DATE - INTERVAL '7 days'),
(1, 'O+', 15, 'Dr. Sharma', CURRENT_DATE - INTERVAL '6 days'),
(1, 'A-', 8, 'Nurse Joy', CURRENT_DATE - INTERVAL '5 days'),
(1, 'O+', 18, 'Dr. Sharma', CURRENT_DATE - INTERVAL '4 days'),
(1, 'O+', 20, 'Dr. Sharma', CURRENT_DATE - INTERVAL '3 days'),
(1, 'A-', 12, 'Nurse Joy', CURRENT_DATE - INTERVAL '2 days'),
(1, 'O+', 25, 'Dr. Sharma', CURRENT_DATE - INTERVAL '1 day');

-- This deletes any duplicate O+ rows and keeps the one with the most units
DELETE FROM Blood_Bank a USING Blood_Bank b 
WHERE a.bloodbank_id < b.bloodbank_id 
AND a.blood_group = b.blood_group;

-- CRITICAL: Make blood_group UNIQUE so this never happens again
ALTER TABLE Blood_Bank ADD CONSTRAINT unique_group_name UNIQUE (blood_group);


CREATE OR REPLACE FUNCTION auto_deduct_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Deduct from the row matching the blood group
    UPDATE Blood_Bank 
    SET total_units = total_units - NEW.units_given 
    WHERE blood_group = NEW.blood_group;

    -- 2. Check if the result went negative
    IF (SELECT total_units FROM Blood_Bank WHERE blood_group = NEW.blood_group) < 0 THEN
        RAISE EXCEPTION 'Insufficient stock for group %!', NEW.blood_group;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Adding 20 more "Busy" days for O+
DO $$
BEGIN
   FOR i IN 1..20 LOOP
      INSERT INTO Hospital_Dispatch (h_id, blood_group, units_given, dispatch_date)
      VALUES (1, 'O+', 30 + i, CURRENT_DATE - (i || ' days')::interval);
   END LOOP;
END $$;

SELECT * FROM Donor LIMIT 1;


SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'donor';



-- 1. Create Users Table
CREATE TABLE Users (
    u_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add 'owner_id' to your existing tables
ALTER TABLE Donor ADD COLUMN owner_id INTEGER REFERENCES Users(u_id);
ALTER TABLE Blood_Bank ADD COLUMN owner_id INTEGER REFERENCES Users(u_id);