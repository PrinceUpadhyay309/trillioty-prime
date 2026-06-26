# Trillioty Prime

Trillioty Prime is a premium, modern digital news blogging, editorial magazine, and citizen discussion ("Charcha") portal. It features a responsive design, multiple Indic themes, rich text formatting, direct messaging, media attachments, and gamified user reputation systems.

---

## Live Deployments

You can explore the live production build hosted on Vercel:

*   **Live Web Application**: [https://trillioty-prime-frontend.vercel.app/](https://trillioty-prime-frontend.vercel.app/)
*   **Production API Server (Vercel Serverless)**: [https://trillioty-prime-backend-git-main-upadhyayan.vercel.app/](https://trillioty-prime-backend-git-main-upadhyayan.vercel.app/)
*   **API Health Check**: [https://trillioty-prime-backend-git-main-upadhyayan.vercel.app/api/health](https://trillioty-prime-backend-git-main-upadhyayan.vercel.app/api/health)

---

## Premium Features

### 1. Ambient Login UI
*   **Split-Screen Design**: Left side highlights the brand milestones; right side handles clean, responsive login/signup forms.
*   **Ambient Glow**: Beautiful animated gradient circles behind the forms that adapt colors depending on the active theme.
*   **Indic Themes**: Full support for four customized color schemes (Light Pencil, Midnight Dark, Ocean Blue, and Clay Orange) toggled dynamically via `data-theme`.

### 2. Charcha Forums & Twitter/X Features
*   **Visual WYSIWYG Editor**: Write post updates with visual formatting (Bold, Italic, Blockquotes, Headers, Links) using a custom safe-HTML parser.
*   **Optional Titles**: Post standard quick thoughts (tweets/updates) without requiring headers.
*   **Clickable Hashtags**: Inline hashtags (e.g. #Elections2026 or #चर्चा) are parsed and clickable, filtering the feed instantly.
*   **Character Limit Counter**: Inline circular progress ring indicating remaining character count (up to 280 characters).

### 3. Social Media & Leaderboards
*   **YouTube Embeds**: Copy and paste any YouTube video link, and the system automatically extracts the ID and renders an inline player.
*   **Weekly Hype Leaderboard**: Users receive 3 Flame Hypes per week. Hype a post to boost its rank on the global sidebar leaderboard.
*   **Reputation Badges**: Gamified badges based on user contribution metrics (Gold Anchor, Silver Editor, Bronze Reporter, Citizen Contributor).

### 4. Direct Messaging & Lobby Chat
*   **Public Chat Lobby**: Live group discussion boards on the Charcha feed page.
*   **1-to-1 DMs**: Private chat channels with active contact lists, rich link previews, and media attachments.
*   **Local Media Attachments**: Upload images and videos directly to DMs or public forums.

---

## Tech Stack

*   **Frontend**: React (Vite), Axios, CSS Variables
*   **Backend**: Node.js, Express (Vercel Serverless Functions)
*   **Database**: MongoDB Atlas (Mongoose ORM)
*   **Hosting**: Vercel (Stateless API Lambdas + CDN Static Client)

---

## Local Development Setup

To run this project locally, clone the repository and set up both folders.

### 1. Prerequisites
Ensure you have Node.js installed. Create a `.env` file inside the `backend/` folder with the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### 2. Run Backend API
```bash
cd backend
npm install
npm run dev
```

### 3. Run Frontend Client
```bash
cd frontend
npm install
npm run dev
```

---

## Database Utility Scripts

We have included two convenient scripts in the `backend/` folder to manage database entries from the console:

*   **Reset Passwords**:
    ```bash
    node reset-password.js <email> <new_password>
    ```
*   **Create Users (Admins/Authors/Readers)**:
    ```bash
    node create-user.js "<name>" <email> <password> <role>
    ```
