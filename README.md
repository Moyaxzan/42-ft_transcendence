# ft_transcendence

ft_transcendence is a **full-stack web application** that brings the classic **Pong** game to life in a modern, secure, and scalable environment.  
It was my final project of the 42 Common Core — and probably the most complete one.  
It combines **game development, web technologies, cybersecurity, DevOps, and distributed architecture** into a single platform.

---

## 🕹️ The idea

At its core, ft_transcendence is a **real-time multiplayer Pong platform**, where users can:

- 🧑‍🤝‍🧑 Play Pong against friends locally, live in the browser;  
- 🏆 Play tournaments;
- 🔐 Authenticate securely (OAuth2 + 2FA);  
- 🎨 Enjoy smooth UI/UX built with TypeScript and Tailwind.

It might *look* simple, but underneath, it’s a full-blown **microservices infrastructure** communicating through APIs and monitored in real time.

---

## 🧱 Architecture Overview

Here’s what powers the project under the hood:

### ⚙️ Backend (Major module — Framework)
The backend was built using **Fastify (Node.js)**, structured into **microservices** for scalability.  
Each service has a clear responsibility — authentication, user management, tournament, and game coordination — all running in Docker containers.

### 🎨 Frontend (Minor module — Toolkit)
The frontend uses **TypeScript** and **Tailwind CSS**, providing a **reactive single-page interface** for smooth navigation, live score updates, and animations.

### 🗃️ Database (Minor module)
All data (users, matches, tournaments) is stored in **SQLite**, ensuring simplicity and consistency while remaining lightweight for containerized deployment.

### 🔐 Authentication & Security
- **Remote Authentication (Major module):** Implemented via **Google OAuth2**, allowing users to sign in using their Google accounts.  
- **Two-Factor Authentication (Major module):** Added an extra layer of protection with TOTP codes and **JWT-based sessions**.  
- All sensitive data is stored securely in environment variables, never in the repo.

### 🧩 Microservices Design (Major module)
The backend was architected around multiple **independent services** communicating through REST APIs.  
This modularity made it easier to maintain, scale, and monitor individual components without affecting the whole system.

### 📊 Log Management (Major module)
Infrastructure for logs was set up using the **ELK stack**:  
- **Elasticsearch** for storing and indexing logs;  
- **Logstash** for data ingestion;  
- **Kibana** for visualization and analysis.  

It allowed us to **trace user actions**, **monitor system health**, and **debug** issues efficiently.

### 📈 Monitoring (Minor module)
We integrated **Prometheus** and **Grafana** to monitor service metrics and create dashboards displaying live CPU, memory, and request data.

### 🌐 Accessibility & Browser Compatibility (Minor module)
The app was tested and optimized for **modern browsers**, including Chrome and Firefox, ensuring responsive layout and consistent rendering.

---

## 🔒 Security Focus

Security was a **core concern** throughout the project:  
- Enforced **HTTPS / WSS** for all connections.  
- Sanitized all input to prevent **XSS** and **SQL injections**.  
- Hashing of user credentials with a modern algorithm.  
- JWT expiry and refresh mechanisms.  
- Strict `.env` management — no secrets in Git.  

---

## 🧰 Tech Stack Summary

| Category | Technology |
|-----------|-------------|
| **Frontend** | TypeScript, Tailwind CSS |
| **Backend** | Node.js, Fastify |
| **Database** | SQLite |
| **Authentication** | Google OAuth2, JWT, 2FA (TOTP) |
| **Infrastructure** | Docker, ELK (Elastic, Logstash, Kibana) |
| **Monitoring** | Prometheus, Grafana |
| **Architecture** | Microservices |
| **Accessibility** | Browser compatibility enhancements |

---

## 💡 Overall

ft_transcendence was more than just a Pong remake — it was a **deep dive into full-stack architecture**.  
It brought together everything learned throughout the 42 curriculum:  
- 🧠 Systems design  
- 💻 Web development  
- 🌐 Network programming  
- 🧱 Security  
- ⚙️ DevOps and monitoring  

It’s a project that truly **transcends** boundaries between fields — and that’s what makes it special.

---

## 🧭 To try it out

```bash
git clone https://github.com/Moyaxzan/42-ft_transcendence.git
cd ft_transcendence
make
```

Then open `http://localhost:8080` and sign in with Google — you're ready to play! 🏓

---

## 📚 Resources

- [Fastify Documentation](https://fastify.dev)  
- [Tailwind CSS](https://tailwindcss.com)  
- [Prometheus](https://prometheus.io)  
- [Grafana](https://grafana.com)  
- [ELK Stack](https://www.elastic.co/elk-stack)  
- [Google OAuth2 Docs](https://developers.google.com/identity/protocols/oauth2)

---

⭐ *Project completed as part of the 42 curriculum.*  
