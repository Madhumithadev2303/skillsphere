const API_URL = 'https://skillsphere-production-8468.up.railway.app/api';

const app = {
    currentUser: null,
    charts: {},
    currentInterview: null,
    codeEditor: null,

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'bx-info-circle';
        if (type === 'error') icon = 'bx-error-circle';
        if (type === 'success') icon = 'bx-check-circle';

        toast.innerHTML = `<i class='bx ${icon}'></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    init() {
        console.log("SkillSphere AI initializing...");
        this.navigate('landing');

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            this.updateNav();
        }

        const textarea = document.getElementById('int-answer');
        if (textarea && typeof CodeMirror !== 'undefined') {
            this.codeEditor = CodeMirror.fromTextArea(textarea, {
                mode: 'javascript',
                theme: 'dracula',
                lineNumbers: true,
                indentUnit: 4
            });
        }
    },

    navigate(viewId) {
        // Handle Layout Toggle
        const isPublic = ['landing', 'auth'].includes(viewId);

        if (isPublic) {
            document.getElementById('public-layout').style.display = 'block';
            document.getElementById('app-layout').style.display = 'none';
        } else {
            if (!this.currentUser) return this.navigate('auth');
            document.getElementById('public-layout').style.display = 'none';
            document.getElementById('app-layout').style.display = 'flex';
        }

        // Hide all sections in both layouts
        document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
        document.querySelectorAll('.app-section').forEach(sec => sec.classList.remove('active'));

        if (viewId === 'dashboard') {
            this.renderDashboard();
            this.updateSidebarActive('nav-dashboard');
            document.getElementById('page-title').innerText = 'System Dashboard';
        } else if (viewId === 'setup-interview') {
            this.updateSidebarActive('nav-setup-interview');
            document.getElementById('page-title').innerText = 'Mock Interview Configuration';
        } else if (viewId === 'interview') {
            document.getElementById('page-title').innerText = 'Active AI Simulation';
        } else if (viewId === 'results') {
            document.getElementById('page-title').innerText = 'Diagnostic Results';
        } else if (viewId === 'study-plan') {
            this.updateSidebarActive('nav-study-plan');
            document.getElementById('page-title').innerText = 'Campus Placement Prep';
        }

        const viewEl = document.getElementById('view-' + viewId);
        if (viewEl) viewEl.classList.add('active');

        window.scrollTo(0, 0);
    },

    updateSidebarActive(activeId) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (document.getElementById(activeId)) document.getElementById(activeId).classList.add('active');
    },

    updateNav() {
        if (this.currentUser) {
            const uName = document.getElementById('nav-username');
            const uRole = document.getElementById('nav-role');
            if (uName) uName.innerText = this.currentUser.username;
            if (uRole) uRole.innerText = this.currentUser.role;
        }
    },

    async handleAuth(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const role = document.getElementById('role').value;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, role })
            });
            if (response.ok) {
                this.currentUser = await response.json();
                this.showToast("Authentication successful", "success");
            } else {
                throw new Error("Backend not connected, using mockup");
            }
        } catch (err) {
            this.showToast("Backend not connected, using mock auth.", "error");
            this.currentUser = { id: Date.now(), username, role, stats: this.getMockStats() };
        }

        localStorage.setItem('user', JSON.stringify(this.currentUser));
        this.updateNav();
        this.navigate('dashboard');
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('user');
        this.navigate('landing');
    },

    getMockStats() {
        return {
            interviews: 0,
            averageScore: 0,
            readiness: 10,
            strongest: 'None',
            history: []
        };
    },

    renderDashboard() {
        const dUser = document.getElementById('dash-username');
        if (dUser) dUser.innerText = this.currentUser.username;

        this.updateStatsDisplay();

        // Fetch fresh stats from backend
        this.fetchStats();
    },

    async fetchStats() {
        try {
            const res = await fetch(`${API_URL}/stats/${this.currentUser.id}`);
            if (res.ok) {
                this.currentUser.stats = await res.json();
                this.updateStatsDisplay();
            }
        } catch (err) {
            console.log("Using cached stats");
        }
    },

    updateStatsDisplay() {
        const { stats } = this.currentUser;
        const interviewsEl = document.getElementById('stat-interviews');
        if (interviewsEl) interviewsEl.innerText = stats.interviews;

        const scoreEl = document.getElementById('stat-score');
        if (scoreEl) scoreEl.innerText = stats.averageScore + '%';

        const readinessEl = document.getElementById('stat-readiness');
        if (readinessEl) {
            readinessEl.innerText = stats.readiness + '%';
            // Let's modify the label to be more student-focused
            const labelEl = readinessEl.previousElementSibling;
            if (labelEl) labelEl.innerText = 'Placement Readiness';
        }

        const strongestEl = document.getElementById('stat-strongest');
        if (strongestEl) strongestEl.innerText = stats.strongest || 'N/A';

        this.renderCharts(stats);
    },

    renderCharts(stats) {
        Chart.defaults.color = '#a1a1aa';
        Chart.defaults.font.family = "'JetBrains Mono', monospace";

        const ctxGrowth = document.getElementById('growthChart')?.getContext('2d');
        if (!ctxGrowth) return;

        if (this.charts.growth) this.charts.growth.destroy();

        const scores = stats.history.length ? stats.history.map(h => h.score || h) : [0, 0, 0, 0, 0];
        const labels = stats.history.length ? stats.history.map((h, i) => 'T+' + (i + 1)) : ['T+1', 'T+2', 'T+3', 'T+4', 'T+5'];

        this.charts.growth = new Chart(ctxGrowth, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Score Trajectory',
                    data: scores,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#09090b',
                    pointBorderColor: '#10b981',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: '#3f3f46' } },
                    x: { grid: { color: '#3f3f46', display: false } }
                }
            }
        });

        const ctxRadar = document.getElementById('radarChart')?.getContext('2d');
        if (!ctxRadar) return;

        if (this.charts.radar) this.charts.radar.destroy();

        this.charts.radar = new Chart(ctxRadar, {
            type: 'radar',
            data: {
                labels: ['Core Concepts', 'Architecture', 'Syntax', 'Performance', 'Problem Solving'],
                datasets: [{
                    label: 'Metamodel',
                    data: stats.history.length ? [85, 75, 90, 60, 80] : [20, 20, 20, 20, 20],
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    borderColor: '#3b82f6',
                    pointBackgroundColor: '#3b82f6',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: '#3f3f46' },
                        grid: { color: '#3f3f46' },
                        pointLabels: { color: '#a1a1aa', font: { size: 10 } },
                        ticks: { display: false, max: 100 }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    },

    async startInterview(e) {
        if (e) e.preventDefault();
        const tech = document.getElementById('interview-tech').value;
        const category = document.getElementById('interview-category').value;
        const diff = document.getElementById('interview-difficulty').value;
        const count = parseInt(document.getElementById('interview-count').value) || 3;

        const loader = document.getElementById('loader-start');
        if (loader) loader.style.display = 'inline-block';

        await new Promise(r => setTimeout(r, 800));

        let questions = [];
        if (category === 'Behavioral') {
            questions = [
                `Tell me about a time you had a conflict regarding ${tech} and resolved it.`,
                `Describe a situation where you had to learn ${tech} quickly.`,
                `How do you handle missing a critical deadline when building a ${tech} project?`
            ];
        } else if (category === 'System Design') {
            questions = [
                `Design a high-concurrency architecture using **${tech}** for a global platform.`,
                `How would you ensure high availability and fault tolerance in a **${diff} ${tech}** system?`,
                `Explain how you would scale a monolithic ${tech} application into microservices.`
            ];
        } else if (category === 'Data Structures') {
            questions = [
                `How would you implement a highly optimized caching mechanism using core **${tech}** data structures?`,
                `Explain the time complexity differences between hash maps and tree-based maps in the context of **${tech}**.`,
                `Write a conceptual pseudo-algorithm to detect a cycle in a strictly typed **${tech}** linked list.`
            ];
        } else {
            questions = [
                `Explain the concept of Dependency Injection in **${tech}** and provide a real-world use case.`,
                `What are the performance implications of using **${tech}** efficiently at the **${diff}** scale?`,
                `Describe a complex threading or caching scenario in **${tech}** and how you would architect a solution.`
            ];
        }

        // Adjust for desired question count
        while (questions.length < count) { questions.push(`Provide an advanced implementation example for ${tech} ${category}`); }
        questions = questions.slice(0, count);

        try {
            const res = await fetch(`${API_URL}/interview/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill: tech, difficulty: diff, type: category, count: count })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.questions && data.questions.length > 0) {
                    questions = data.questions;
                }
            } else {
                this.showToast("Failed to connect to API, using mock generation.", "info");
            }
        } catch (err) {
            this.showToast("Mocking intelligence engine generation.", "info");
        }

        this.currentInterview = { skill: tech, difficulty: diff, type: category, questions, currentIndex: 0, results: [] };

        if (this.codeEditor) {
            let mode = 'javascript';
            if (tech === 'Java') mode = 'text/x-java';
            if (tech === 'Python') mode = 'python';
            if (tech === 'SQL') mode = 'sql';
            if (tech === 'C++') mode = 'text/x-c++src';

            this.codeEditor.setOption('mode', mode);
            this.codeEditor.setValue("");

            // Re-render CodeMirror so it aligns correctly after changing views
            setTimeout(() => this.codeEditor.refresh(), 50);
        }

        if (loader) loader.style.display = 'none';

        this.showCurrentQuestion();
        this.navigate('interview');
    },

    showCurrentQuestion() {
        const { skill, difficulty, questions, currentIndex } = this.currentInterview;

        document.getElementById('int-topic').innerText = skill;
        document.getElementById('int-level').innerText = difficulty;

        const terminal = document.getElementById('terminal-panel');
        if (terminal) terminal.style.display = 'none';

        // Simulating typewriter typing effect
        const qEl = document.getElementById('int-question');
        qEl.innerText = "";
        let i = 0;
        const txt = questions[currentIndex];

        function typeWriter() {
            if (i < txt.length) {
                qEl.innerHTML += txt.charAt(i);
                i++;
                setTimeout(typeWriter, 15); // very fast typing
            } else {
                if (typeof marked !== 'undefined') {
                    qEl.innerHTML = marked.parse(txt);
                }
            }
        }
        typeWriter();

        if (this.codeEditor) {
            this.codeEditor.setValue('');
        } else {
            document.getElementById('int-answer').value = '';
        }

        document.getElementById('int-counter').innerText = `Stage ${currentIndex + 1}/${questions.length}`;
        document.getElementById('int-progress').innerText = `Evaluating Input ${currentIndex + 1}`;

        const btn = document.getElementById('btn-submit-answer');
        if (btn) {
            if (currentIndex === questions.length - 1) {
                btn.innerHTML = `Execute Final Compilation <i class='bx bx-check-double'></i><span class="loader ml-2" style="display:none;" id="loader-eval"></span>`;
            } else {
                btn.innerHTML = `Execute & Proceed <i class='bx bx-right-arrow-alt'></i><span class="loader ml-2" style="display:none;" id="loader-eval"></span>`;
            }
        }
    },

    async submitAnswer() {
        let answer = "";
        if (this.codeEditor) {
            answer = this.codeEditor.getValue();
        } else {
            answer = document.getElementById('int-answer').value;
        }

        if (!answer.trim()) {
            this.showToast("Compiler error: Empty input not allowed.", "error");
            return;
        }

        let loader = document.getElementById('loader-eval');
        if (loader) loader.style.display = 'inline-block';

        const terminal = document.getElementById('terminal-panel');
        const termOut = document.getElementById('terminal-output');
        if (terminal && termOut) {
            terminal.style.display = 'flex';
            termOut.innerHTML = `<span class="info">> Analyzing lexical structure...</span>`;
            await new Promise(r => setTimeout(r, 600));
            termOut.innerHTML += `<br><span class="info">> Formatting payload and scanning complexity...</span>`;
            await new Promise(r => setTimeout(r, 800));
        }

        const { skill, questions, currentIndex } = this.currentInterview;
        const currentQuestion = questions[currentIndex];

        let result = {
            score: Math.floor(Math.random() * 30) + 70, // Mock 70-100
            feedback: "Variable tracking shows good coverage of core concepts, however, deeper analysis of the underlying architecture was omitted.",
            idealResponse: "A perfect response would instantiate the definition, explain runtime problem-solving (uncoupling states), and write a pseudo-code implementation block."
        };

        try {
            const res = await fetch(`${API_URL}/interview/evaluate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    question: currentQuestion,
                    answer: answer,
                    skill: skill
                })
            });
            if (res.ok) {
                result = await res.json();
                this.currentUser.stats = result.updatedStats;
                localStorage.setItem('user', JSON.stringify(this.currentUser));
            } else {
                throw new Error("API Offline Error");
            }
        } catch (err) {
            this.showToast("Mocking evaluation processor.", "info");
            this.currentUser.stats.interviews += 1;

            // if history contains integers instead of objects
            this.currentUser.stats.history.push(result.score);
            let sums = this.currentUser.stats.history.reduce((a, b) => a + (b.score || b), 0);

            this.currentUser.stats.averageScore = Math.round(sums / this.currentUser.stats.interviews);
            this.currentUser.stats.readiness = Math.min(100, this.currentUser.stats.averageScore + (this.currentUser.stats.interviews * 2));
            this.currentUser.stats.strongest = skill;
            localStorage.setItem('user', JSON.stringify(this.currentUser));
        }

        this.currentInterview.results.push({
            question: currentQuestion,
            answer: answer,
            score: result.score,
            feedback: result.feedback,
            idealResponse: result.idealResponse
        });

        if (loader) loader.style.display = 'none';

        if (this.currentInterview.currentIndex < this.currentInterview.questions.length - 1) {
            this.currentInterview.currentIndex++;
            this.showCurrentQuestion();
        } else {
            this.showFinalResults();
        }
    },

    showFinalResults() {
        const results = this.currentInterview.results;
        const avgScore = Math.round(results.reduce((a, b) => a + b.score, 0) / results.length);

        document.getElementById('res-score').innerText = avgScore;

        let breakdownHTML = '';
        results.forEach((r, idx) => {
            let colorScore = r.score >= 80 ? 'var(--accent)' : 'var(--warning)';
            breakdownHTML += `
              <div class="feedback-card">
                <div class="feedback-q">
                   <div style="display:flex; justify-content:space-between; margin-bottom: 0.5rem; color: var(--text-main);">
                     <strong># Compile Log ${idx + 1}</strong>
                     <span style="color: ${colorScore}; font-weight: 700;">Score: ${r.score}</span>
                   </div>
                   > ${r.question}
                </div>
                
                <div class="mt-3">
                  <h5 class="text-accent mb-2"><i class='bx bx-bot'></i> Evaluation Feed</h5>
                  <p style="font-size: 0.95rem;">${r.feedback}</p>
                </div>
                <div class="mt-4">
                  <h5 class="text-muted mb-2"><i class='bx bx-book-bookmark'></i> Ideal Implementation</h5>
                  <p style="font-size: 0.9rem; font-style: italic; color: var(--text-muted); border-left: 2px solid var(--border); padding-left: 1rem; margin-left: 0.5rem;">${r.idealResponse}</p>
                </div>
              </div>
            `;
        });

        const breakdownContainer = document.getElementById('res-breakdown');
        if (breakdownContainer) breakdownContainer.innerHTML = breakdownHTML;

        // Generate dynamic guidance based on type and score
        const guidanceEl = document.getElementById('res-guidance');
        if (guidanceEl) {
            const type = this.currentInterview.type || 'Technical Core';

            if (avgScore >= 85) {
                guidanceEl.innerHTML = `<strong>System Diagnosis: Highly Proficient.</strong><br>You have thoroughly demonstrated expertise in <em>${type}</em>. Your next step should be tackling specialized architectural challenges or taking on leadership and mentoring roles to solidify your knowledge base.`;
            } else if (avgScore >= 70) {
                guidanceEl.innerHTML = `<strong>System Diagnosis: Competent with Gaps.</strong><br>Your <em>${type}</em> foundation is solid, but you dropped points on deep low-level mechanics. <strong>Next Step:</strong> Re-run a deep dive session focusing specifically on core abstractions and runtime performance optimizations.`;
            } else {
                guidanceEl.innerHTML = `<strong>System Diagnosis: Fundamental Review Required.</strong><br>Your <em>${type}</em> concepts need reinforcing. <strong>Next Step:</strong> Revert to simpler component-level implementations. Do not proceed to advanced architecture until your foundational algorithms and raw syntax are flawless.`;
            }
        }

        this.navigate('results');
    },

    async generateStudyPlan() {
        const tier = document.getElementById('plan-tier').value;
        const stack = document.getElementById('plan-stack').value;
        const loader = document.getElementById('loader-plan');
        const outputContainer = document.getElementById('plan-output-container');
        const outputContent = document.getElementById('plan-output-content');

        if (loader) loader.style.display = 'inline-block';
        if (outputContainer) outputContainer.style.display = 'none';

        // Simulate network delay
        await new Promise(r => setTimeout(r, 1200));

        let planMarkdown = `### Targeted Study Plan: ${tier} Software Engineer\n\n`;
        planMarkdown += `> Optimized for students focusing on **${stack}** integrations.\n\n`;

        if (tier === 'FAANG') {
            planMarkdown += `**Month 1: Core Algorithms & Data Structures**\n- Master Arrays, Hash Maps, Linked Lists, and Two-Pointer logic.\n- **Focus Areas:** Time/Space Complexity. Solve 30 Medium Leetcode problems minimum.\n\n`;
            planMarkdown += `**Month 2: Advanced DSA & Specialty**\n- Graph traversal (BFS/DFS), Dynamic Programming essentials.\n- Mock interviews focusing on Space/Time complexity constraints under pressure.\n\n`;

            if (stack === 'Data Science') {
                planMarkdown += `**Month 3: System Design & ML Ops Basics**\n- Read "Machine Learning System Design Interview".\n- Build an end-to-end ML pipeline with deployment.\n`;
            } else if (stack === 'Cloud') {
                planMarkdown += `**Month 3: Distributed Systems Design**\n- Master CAP Theorem, Consistent Hashing, and Load Balancing architecture.\n- Focus on scalability limits and state management.\n`;
            } else {
                planMarkdown += `**Month 3: System Design Basics & Behavioral**\n- Read "Grokking the System Design Interview" basics.\n- Prepare STAR method answers for past academic group projects.\n`;
            }

        } else if (tier === 'Startups') {
            planMarkdown += `**Weeks 1-3: Practical ${stack} Project Mastery**\n`;

            if (stack === 'Python') {
                planMarkdown += `- Build a full-stack Django/FastAPI application and deploy it to Render.\n- Understand ORMs, Celery background tasks, and API security.\n\n`;
            } else if (stack === 'Data Science') {
                planMarkdown += `- Build a predictive model API using Scikit-learn/Pandas and expose it via Flask/FastAPI.\n- Participate in 2 Kaggle beginner competitions.\n\n`;
            } else if (stack === 'Cloud') {
                planMarkdown += `- Deploy a 3-tier application on AWS/GCP using Terraform or CloudFormation.\n- Understand Docker, Kubernetes basics, and CI/CD pipelines (GitHub Actions).\n\n`;
            } else if (stack === 'C++') {
                planMarkdown += `- Build a high-performance system utility or a basic game engine clone.\n- Focus on memory management (Smart Pointers), multithreading, and STL.\n\n`;
            } else {
                planMarkdown += `- Build a full-stack CRUD application and deploy it to Vercel/Heroku.\n- Understand REST, WebSockets, and Authentication patterns.\n\n`;
            }

            planMarkdown += `**Weeks 4-5: System & Database Design**\n- SQL vs NoSQL trade-offs.\n- How to cache queries and handle API rate limiting in dynamic environments.\n\n`;
            planMarkdown += `**Week 6: Agile & Product Ownership**\n- Familiarize yourself with PR lifecycles, rebasing, and shipping MVPs quickly.\n`;
        } else {
            planMarkdown += `**Weeks 1-2: Object-Oriented Principles (OOP)**\n- Thorough understanding of Polymorphism, Inheritance, Encapsulation.\n- Learn Core Design Patterns (Singleton, Factory, Observer).\n\n`;

            if (stack === 'Java') {
                planMarkdown += `**Weeks 3-4: Spring Framework Essentials**\n- Understand Beans, Dependency Injection, and Spring Boot Auto-configuration.\n- Build a standard CRUD REST API with JPA/Hibernate.\n\n`;
            } else if (stack === 'Cloud') {
                planMarkdown += `**Weeks 3-4: Cloud Fundamentals**\n- Prepare for AWS Certified Cloud Practitioner / Azure Fundamentals exams.\n- Set up basic Cloud networking (VPCs, Subnets).\n\n`;
            } else if (stack === 'Python') {
                planMarkdown += `**Weeks 3-4: Python Best Practices**\n- Learn Pythonic idioms (list comprehensions, generators, decorators).\n- Practice string manipulation and file handling.\n\n`;
            } else {
                planMarkdown += `**Weeks 3-4: Database & SQL Mastery**\n- Writing complex JOIN queries, understanding Indexes.\n- Basic understanding of how ORMs work in the ${stack} ecosystem.\n\n`;
            }

            planMarkdown += `**Weeks 5-6: Aptitude, Logic & Behavioral Tests**\n- Practice quantitative aptitude and logical reasoning questions typical of enterprise placement tests.\n- Refine your resume and LinkedIn profile.\n`;
        }

        if (outputContent) {
            if (typeof marked !== 'undefined') {
                outputContent.innerHTML = marked.parse(planMarkdown);
            } else {
                outputContent.innerText = planMarkdown;
            }
        }

        if (loader) loader.style.display = 'none';
        if (outputContainer) outputContainer.style.display = 'block';
        this.showToast("Study Plan Generated Successfully!", "success");
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());
