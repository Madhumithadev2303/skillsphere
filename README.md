# 🚀 SkillSphere AI - Pro Developer Dashboard

SkillSphere AI is a premium, full-stack application designed to help computer science students, junior developers, and aspiring engineers prepare for technical interviews and build comprehensive study plans.

Featuring a sleek "Cyberpunk/Pro Developer" aesthetic, it leverages dynamic AI-mocked questions, a built-in code editor (CodeMirror), and an intelligent study planner to elevate placement readiness.

## ✨ Key Features

*   **🎙️ AI-Powered Mock Interviews:** Dynamically generated technical questions tailored to specific tools (Java, Python, Cloud, Data Science, C++, etc.) and difficulty levels (Freshman to Senior/New Grad).
*   **💻 Integrated Code Editor:** Answer technical questions directly within the browser using a fully functional CodeMirror instance with syntax highlighting.
*   **📅 Dynamic Study Planner:** Automatically generates weekly or monthly learning roadmaps tailored to your target company tier (FAANG, Startup, Enterprise) and primary technology stack.
*   **📊 Placement Readiness Tracking:** A beautifully visualized dashboard tracking your recent mock interview performance, total questions answered, and an overall readiness score using Chart.js.
*   **🎨 Cyberpunk Aesthetic:** A modern, dark-themed UI featuring glassmorphism, glowing micro-animations, and a simulated terminal output system for evaluating answers.

## 🛠️ Technology Stack

**Frontend (Static & Lightning Fast)**
*   HTML5 / CSS3 (Vanilla)
*   JavaScript (ES6+)
*   [CodeMirror](https://codemirror.net/) (Code Editing)
*   [Chart.js](https://www.chartjs.org/) (Data Visualization)
*   [Marked.js](https://marked.js.org/) (Markdown Parsing)

**Backend (Robust & Scalable)**
*   Java 17
*   Spring Boot 3.x
*   Spring Data JPA & Hibernate
*   Spring Web (REST API)
*   Spring Security

**Database & Hosting**
*   **Database:** PostgreSQL (Hosted via [Supabase](https://supabase.com/))
*   **Backend Hosting:** [Railway.app](https://railway.app/)
*   **Frontend Hosting:** [Netlify](https://www.netlify.com/)

---

## 🚦 How to Run Locally

If you wish to clone this project and run it on your own machine, follow these steps:

### 1. Prerequisites
*   Java Development Kit (JDK 17 or higher)
*   Maven (`mvn`) installed
*   A local PostgreSQL or MySQL instance (or a free Supabase account)

### 2. Backend Setup
1.  Navigate into the backend directory: `cd backend`
2.  Open `src/main/resources/application.properties`.
3.  Update the database connection strings to point to your local database or remote Supabase instance.
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/skillsphere
    spring.datasource.username=postgres
    spring.datasource.password=your_password
    ```
4.  Run the application using the Maven wrapper:
    ```bash
    ./mvnw spring-boot:run
    ```
    *(The backend will start on `http://localhost:8080`)*

### 3. Frontend Setup
1.  Navigate to the `frontend/js/app.js` file.
2.  Ensure the `API_URL` variable at the very top is pointing to your local environment:
    ```javascript
    const API_URL = 'http://localhost:8080/api';
    ```
3.  Simply open `frontend/index.html` in your web browser (or use the VS Code Live Server extension) to view the application!

---

## 🌐 Live Deployment Configuration
In production, the backend `application.properties` reads directly from Environment Variables provided by Railway (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`). 

The frontend `app.js` is updated to point to the live Railway domain before being dropped into Netlify.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
