# AI Campus Placement Operations & Interview Coordination Agent

An end-to-end autonomous multi-agent platform for university placement operations, corporate hiring drives, explainable candidate matching, intelligent interview scheduling, multi-party conflict negotiation, and dynamic offer cascade management.

---

## 🌟 Key Architecture & Capabilities

```text
                             ┌───────────────────────────────────────┐
                             │       Unified React 19 Frontend       │
                             │  (Tailwind + GSAP + Real-time Sockets) │
                             └───────────────────┬───────────────────┘
                                                 │ REST API + Socket.io
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │      Primary Node/Express Backend     │
                             │         (Port 5000 / Mongoose)        │
                             └───────┬───────────┬───────────┬───────┘
                                     │           │           │
             ┌───────────────────────┘           │           └───────────────────────┐
             ▼                                   ▼                                   ▼
    ┌─────────────────┐                 ┌─────────────────┐                 ┌─────────────────┐
    │  MongoDB Atlas  │                 │  Autonomous AI  │                 │ Python AI Service│
    │  (14 canonical  │                 │  Agent Engine   │                 │   (Port 8000 /  │
    │    models)      │                 │ (Orchestrator,  │                 │  Deterministic  │
    └─────────────────┘                 │  Matching,      │                 │  JD Parser &    │
                                        │  Coordination,  │                 │  Eligibility)   │
                                        │  Notification)  │                 └─────────────────┘
                                        └─────────────────┘
```

1. **Intelligent JD & Resume Ingestion**: Extracts academic rules (CGPA cutoffs, allowed branches, backlog thresholds) and core technical requirements.
2. **Deterministic Academic Eligibility Filter**: Python AI engine evaluates student eligibility with clear, auditable reasoning.
3. **5-Pillar Explainable Candidate Matching**: Multi-weighted fit score across Core Skills (50%), Project Relevance (20%), Preferred Skills (10%), Academics (10%), and Experience/Certifications (10%) with concrete evidence citations.
4. **"Why This Student?" Explainability & 3-Day Prep Roadmap**: Actionable transparency showing why a student was selected alongside an automated daily preparation checklist targeting identified skill gaps.
5. **Panel & Room Interview Coordination**: Intelligent slot allocation respecting interviewer panel availability and venue constraints.
6. **Multi-Party Autonomous Conflict Resolution**: Real-time clash detection (panel overlap, student collisions) with AI negotiation proposals and Human-in-the-Loop TPO approval.
7. **Dynamic Offer Cascade & Rematching**: When an offer is accepted, the orchestrator updates student status to `placed`, cancels conflicting future interviews, and dynamically backfills vacated interview slots with the top eligible runner-up candidate.
8. **Real-Time Notification Dispatch**: Socket.io push notifications to Students, Panels, and TPO admins.

---

## 🚀 Quick Startup Guide

### 1. Prerequisites
- **Node.js** >= 18.x
- **Python** >= 3.10
- **MongoDB** (Atlas connection string or local MongoDB)

---

### 2. Backend Setup & Run

```bash
cd backend
npm install

# Copy example environment file
cp .env.example .env

# (Optional) Seed the synthetic demo database
npm run seed

# Start the Backend Server (Port 5000)
npm run dev
```

---

### 3. Frontend Setup & Run

```bash
# In the project root directory:
npm install

# Start the React / Vite Development Server (Port 5173)
npm run dev
```

Open **http://localhost:5173** in your browser.

---

### 4. (Optional) Python AI Engine Service

The Node backend includes built-in fast fallback logic. To run the dedicated Python microservice:

```bash
cd services/ai_engine
python3 server.py
```
*Service starts on `http://localhost:8000`*.

---

## 🧪 Testing

### Run All Backend Unit & Architecture Tests:
```bash
cd backend
npm test
```

### Run Full-Stack End-to-End Integration Suite:
```bash
cd backend
npm run test:integration
```

### Run Python AI Tests:
```bash
PYTHONPATH="features/jd eligibility:services/ai_engine" pytest "features/jd eligibility/m2/tests"
```

---

## 🎬 5-Minute Live Demo Walkthrough

1. **Step 1: Dashboard Overview**: View the Executive Summary metrics (Batch Strength, Placed Students, Average Package, Active Drives).
2. **Step 2: JD & Eligibility Matrix**: Navigate to the **Pipeline** tab. Click **1. JD Intake** to inspect active job descriptions. Switch to **2. Eligibility** to review Python AI verified candidates with zero backlogs and CGPA cutoffs.
3. **Step 3: 5-Pillar Matching**: Click **3. AI Matching**. Inspect ranked candidates.
4. **Step 4: "Why This Student?" Modal**: Click the **"Why This Student?"** button on any candidate card. Explore the 5-pillar score visualizer, verified evidence items from projects and certifications, and the personalized 3-day technical readiness preparation checklist.
5. **Step 5: Schedule Interviews**: Click **Batch Schedule Interviews**. Observe autonomous slot booking into rooms and interviewer panels.
6. **Step 6: Conflict Alert & Autonomous Negotiation**: Return to the **Dashboard** or **Interviews** tab. Notice the detected Panel Overlap collision alert. Click **Resolve Conflict**.
7. **Step 7: TPO Approval**: Review the AI Negotiation proposal shifting the slot to a clash-free window. Click **Approve & Update Schedule (TPO)**. Notice the live schedule update and real-time toast notifications.
8. **Step 8: Offer Acceptance & Dynamic Rematching**: In the **6. Final Offers** stage, click **Accept Offer & Trigger Rematch** on a student offer. Watch the autonomous cascade in action: student marked `placed`, future conflicting interviews cancelled, and runner-up candidate backfilled into the vacant slot.
