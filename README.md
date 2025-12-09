Toodoz
A collaborative, full-stack task management application built with Vue.js 3 and Node.js.

Overview
Toodoz allows users to manage tasks through a clean, responsive interface styled with Tailwind CSS. The application supports personal to-do lists as well as collaborative group lists where members can be invited via email. It features secure session-based authentication, CSRF protection, and persistent data storage using MySQL.

Tech Stack
Frontend: Vue 3 (Composition API), Vite, Vue Router, Tailwind CSS.

Backend: Node.js, Express, Sequelize ORM, MySQL.

Security: Bcrypt (hashing), CSRF tokens, HttpOnly cookies.

Setup & Installation
1. Database
Ensure you have MySQL installed and running. Create a database named toodoz.

SQL

CREATE DATABASE toodoz;
2. Backend (Server)
Navigate to the server directory, install dependencies, and configure the environment.


cd server
npm install
cp .env.example .env
# Edit .env with your MySQL credentials (DB_USER, DB_PASS)
npm run dev
The server runs on port 4000.

3. Frontend (Client)
In the root project directory, install dependencies and start the Vite server.

Bash

npm install
npm run dev
The application will be accessible at http://localhost:5173.

Key Features
Authentication: Secure registration and login with session management.

List Management: Create Personal, Work, Grocery, or Trip lists.

Collaboration: Create "Group" lists and invite other registered users by email to share tasks.

Task Tracking: Add tasks with priorities (Low/Med/High), due dates, and descriptions. Cycle statuses from To Do → Doing → Done.

Organization: Filter tasks by assignee within group projects.
