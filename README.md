# 🛡️ Automated AI Code Reviewer

An interactive, premium-grade AI-powered code reviewer that analyzes code, identifies bugs, scores security vulnerabilities, visualizes computational complexity curves, provides beginner-friendly metaphors, and refactors code instantly—equipped with personality-driven feedback and dual-solution comparison.

## 🚀 Features

1. **AI Personality Modes**: Choose from 4 distinct reviewer personas:
   * **Strict Senior Developer**: A direct, hyper-critical review pointing out violation of production standards.
   * **Friendly Mentor**: Warm, supportive, highly educational guidance with code compliments.
   * **Security Expert**: Analytics focusing on security vulnerabilities and OWASP Top 10 prevention.
   * **FAANG Interviewer**: Algorithmic deep-dive focused on computational complexity and trade-offs.
2. **Complexity Visualizer**: Renders interactive operations growth curves (e.g. $O(N)$ vs $O(N^2)$) dynamically using **Recharts**.
3. **One-Click AI Refactor**: Re-write messy code cleanly with an direct "Apply Refactor" button that injects optimized code back into the editor with particle confetti!
4. **"Explain Like Beginner"**: Explains complex code with real-world, physical analogies and step-by-step accordion annotations.
5. **Compare Solutions Mode**: Compare readability, speed, and scalability of two solutions side-by-side (e.g. Recursive vs. Memoized Fibonacci).
6. **Persistent Analysis History**: Review history is stored in a MongoDB database and loaded on-demand in a slick glassmorphic sidebar.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Monaco Code Editor (`@monaco-editor/react`), Recharts, Framer Motion, Lucide Icons, Canvas Confetti.
* **Backend**: Node.js, Express, MongoDB (Mongoose), Google Gemini SDK (`@google/generative-ai`).
* **Styling**: Premium custom Glassmorphism and dark mode Vanilla CSS (HSL tailors).

---

## 💻 Installation & Setup

### Prerequisites
* [Node.js](https://nodejs.org/) installed
* [MongoDB](https://www.mongodb.com/) cluster or local database instance
* [Gemini API Key](https://aistudio.google.com/)

### 1. Clone & Set Up Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Set Up Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## ⚙️ Custom Configurations

Click the **Gear icon (⚙️) in the top-right header** of the UI to:
* Dynamic override of Gemini API Key.
* Switch between models seamlessly (`gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-1.5-pro`) to bypass high-traffic capacity spikes (503).
