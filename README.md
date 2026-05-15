# CrewBoard

A full-stack project management web application where users can create projects, manage team members, assign tasks, and track progress using role-based access control.

## 🚀 Features

*   **Authentication:** Secure signup/login using JWT and bcrypt.
*   **Role-Based Access Control:**
    *   **Admin:** Can create projects, add members by email, create tasks, assign tasks to project members, edit/delete any task in their project, and delete projects.
    *   **Member:** Can view projects they are added to, view tasks assigned to them, and update the status of their own assigned tasks.
*   **Project Management:** Create and track projects with deadlines and statuses (Active, On Hold, Completed).
*   **Task Management:** Create tasks with priority (Low, Medium, High), status (Pending, In Progress, Completed), and due dates. Overdue tasks are automatically flagged.
*   **Live Dashboard:** View role-specific statistics, recent tasks, and overdue items.

## 🛠️ Tech Stack

*   **Frontend:** Next.js 14 (App Router), React, Tailwind CSS
*   **Backend:** Next.js API Routes (REST APIs)
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** JSON Web Tokens (JWT) + bcryptjs

## 💻 Running Locally

### Prerequisites

*   Node.js (v18+)
*   PostgreSQL database (Local or Cloud like Railway)

### Setup

1.  **Clone the repository** (if applicable) and navigate to the project directory:
    ```bash
    cd crewboard
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Copy the `.env.example` file to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
    Open the `.env` file and update the `DATABASE_URL` with your PostgreSQL connection string, and set a strong `JWT_SECRET`.

4.  **Database Migration & Seeding:**
    Run the following commands to create the database tables and seed it with demo data:
    ```bash
    npx prisma db push
    npm run db:seed
    ```

5.  **Start the development server:**
    ```bash
    npm run dev
    ```

6.  **Access the app:**
    Open your browser and navigate to `http://localhost:3000`

## 🌍 Deployment on Railway

1.  Create a Railway account at [railway.app](https://railway.app).
2.  Create a new **PostgreSQL** service in a new project.
3.  Connect your GitHub repository to Railway and deploy the `crewboard` code.
4.  In the Railway project settings for your web app, go to the **Variables** tab and add:
    *   `DATABASE_URL`: Set to `${{Postgres.DATABASE_URL}}` (Railway handles this reference automatically).
    *   `JWT_SECRET`: Generate a random secure string.
5.  Railway will automatically detect the Next.js project and the Prisma schema. The `npx prisma db push` will be needed, you can run this via Railway's custom build/start commands, or run `npx prisma db push` locally using the Railway provided connection string.
6.  (Optional) Provide a `NEXT_PUBLIC_APP_URL` if needed.

## 🔐 Demo Credentials

Use these credentials to test the application after running the seed script:

**Admin Account:**
*   Email: `admin@example.com`
*   Password: `Admin@123`

**Member Account:**
*   Email: `member@example.com`
*   Password: `Member@123`

## 🗣️ Presentation Points (Demo Script)

*   **Problem Solved:** CrewBoard provides a clean, fast, and structured way for teams to collaborate without clutter. It ensures data privacy through strict role-based access.
*   **Role Demo:** First, log in as an **Admin**. Show how to create a project, add a member (using `member@example.com`), and assign a task. Highlight the Admin dashboard stats.
*   **Switching Roles:** Log out and log back in as the **Member**. Show how the view changes—the Member only sees their assigned projects and tasks, and the UI restricts them from creating new projects or changing other people's tasks.
*   **Key Technical Highlight:** Emphasize the use of Next.js API Routes coupled with Prisma middleware to ensure that access control isn't just on the UI layer, but strictly enforced at the backend database level.
