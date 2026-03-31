🚀 Enterprise Task Manager - Backend API
Robust Express-based backend for the Jira-clone ecosystem, managing identities, team structures, and iterative sprint lifecycles.

🏗️ Architecture
Engine: Node.js & Express
Database: MongoDB with Mongoose ODM
Security: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)
Validation: Helmet.js for header security and custom middlewares for auth verification.
🛠️ Components
Identity Registry: Handles user registration and log-in.
Team Nexus: Manages multi-member team structures with recursive member population.
Sprint Engine: Orchestrates the transition between planned, active, and completed iterations.
Objective Tracker: CRUD operations for tasks with rich metadata (priority, type, estimate).
🚦 Endpoint Directory
POST /api/auth/register - Create new operator identity.
POST /api/auth/login - Synchronize session and retrieve tokens.
GET /api/tasks/:teamId - Retrieve objectives for a specific workspace.
POST /api/sprints - Initialize a new project iteration.
POST /api/teams/add-member - Recruit existing users into a workspace.
🧪 Quick Start
Configure .env with MONGO_URI and JWT_SECRET.
Execute npm install.
Launch with npm run dev.

