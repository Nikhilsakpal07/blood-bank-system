🩸 RaktaSetu AI: Smart Multi-Tenant Blood Management
RaktaSetu (The Blood Bridge) is an intelligent, secure, and scalable SaaS platform designed for the Indian healthcare ecosystem. It enables multiple blood bank branches to manage isolated datasets while using Neural Predictive Analytics to forecast life-saving demand.

🇮🇳 Project Highlights
Multi-Tenant Isolation: Secure data partitioning for different administrative branches using PostgreSQL Row-Level logic.

AI Demand Forecasting: Integrated Synaptic.js neural network that predicts 7-day blood group requirements based on historical dispatch.

Smart Inventory: Real-time stock tracking with "AI Priority" tagging for critical blood groups.

Automated Logistics: SQL Triggers manage stock levels automatically during donor registration and hospital dispatches.

🛠️ Technical Stack
Frontend: React.js, Tailwind CSS, Framer Motion (Animations)

Backend: Node.js, Express.js

Database: PostgreSQL (Relational Mapping & Triggers)

AI Engine: Synaptic.js (Neural Networks)

📁 System Architecture
RaktaSetu uses a Private Data Partitioning model. Every admin/user is assigned a unique u_id upon login, ensuring that sensitive donor and hospital data never "bleeds" into another branch's workspace.

🚀 Installation
Clone & Install

Bash
git clone https://github.com/Nikhilsakpal07/blood-bank-system.git
cd blood-bank-system
npm install
Database Setup

Import the schema from /database/blood-bank-system.sql into your PostgreSQL instance.

Update the .env file with your database credentials.

Run the Engines

Bash
# Start the Backend
cd server && node index.js

# Start the Frontend
cd client && npm run dev
🔮 Future Roadmap (The "Indian" Vision)
ABHA Integration: Linking donor profiles with Ayushman Bharat Digital Health accounts.

Aadhaar Verification: Implementing OTP-based donor identity verification.

Drone Logistics: Real-time tracking for emergency blood delivery via medical drones.
