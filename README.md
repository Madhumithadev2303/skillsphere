# SkillSphere AI - Developer Dashboard & Interview Prep

Hey there! 👋 Welcome to **SkillSphere AI**. I built this full-stack application because preparing for technical interviews and keeping track of what to study can be overwhelming, especially for students and junior devs. I wanted a single, sleek place to practice mock interviews, write real code, and generate structured study plans.

Plus, I really wanted to build something with a dark, cyberpunk-inspired "developer dashboard" aesthetic because let's be honest, it just looks cool.

## What It Does

- **Dynamic Mock Interviews:** It generates technical questions based on what you actually want to study (Java, Python, Data Science, System Design, whatever) and scales the difficulty from Freshman level all the way to Senior/New Grad.
- **Built-In Code Editor:** Instead of just typing text, I integrated `CodeMirror` so you can write your answers with actual syntax highlighting right in the browser.
- **Smart Study Planner:** You tell it your target tier (FAANG, Startup, or Enterprise) and your main tech stack, and it spits out a structured weekly/monthly roadmap of what you should focus on.
- **Progress Tracking:** The dashboard uses `Chart.js` to log your recent performance, track your overall "Placement Readiness" score, and keep you motivated.

## The Tech Stack

I wanted to keep the frontend completely decoupled and lightning-fast, while having a robust backend to handle the logic and database connections.

**Frontend:**
- Pure Vanilla HTML, CSS, and JavaScript. No bulky frameworks.
- Hosted on Netlify.
- Libraries: `Chart.js` for the graphs, `CodeMirror` for the IDE, and `Marked.js` to parse markdown from the AI engine.

**Backend & Database:**
- Built with **Java 17** & **Spring Boot 3**.
- **PostgreSQL** database hosted on Supabase.
- Spring Data JPA/Hibernate for ORM.
- Hosted on Railway.

## Running It Locally

If you want to pull this down and run it on your own machine, it's pretty straightforward.

### 1. The Backend
You'll need Java 17+ and Maven installed.
1. `cd backend`
2. Open `src/main/resources/application.properties` and swap out the database URL, username, and password with your own local Postgres instance (or a free Supabase DB).
3. Run it using the Maven wrapper: `./mvnw spring-boot:run`
*(It defaults to running on port 8080).*

### 2. The Frontend
Because it's vanilla JS, you don't even need Node.js to run it.
1. Just make sure the `API_URL` variable at the very top of `frontend/js/app.js` points to your backend (e.g., `const API_URL = 'http://localhost:8080/api';`).
2. Open `index.html` in your browser! (Or use something like the VS Code Live Server extension so things load properly).

## Future Ideas
I'm planning to eventually hook the backend up directly to the Gemini or OpenAI API to actually grade the user's CodeMirror input in real-time, rather than just simulating the backend terminal output. 

Feel free to fork it, break it, or use it to study..!
Live Demo: https://get-skillsphere-ai.netlify.app/

