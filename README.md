# Team Pulse AI ⚡️

**Predicting Team Failures Before They Happen**

*Built for VibeForge 1.0 Hackathon — AI in Workplace (HR & Team Dynamics)*

---

## 🛑 The Problem
Companies today can measure what people *produce* — tasks closed, attendance, hours logged — but have no reliable way to see relationship and collaboration health in real-time. As a result, HR and team leads usually find out about burnout, isolation, or conflict only *after* the damage is visible: a resignation, a delayed project, a sudden drop in team performance. 

By then, the cost is already paid.

## 💡 Our Solution
**Team Pulse AI** is a lightweight, privacy-conscious dashboard that analyzes non-private workplace collaboration signals to generate a **Team Health Score**. It surfaces early warning signs of burnout, isolation, and communication breakdowns before they escalate.

Unlike productivity trackers, we don't measure output. **We measure the health of collaboration itself.**

### Key Features
1. **The Pulse Engine:** A deterministic, explainable algorithm that takes Response Lag, Meeting Frequency, and Mood Check-ins to calculate a composite Team Health Score.
2. **Interactive Configuration:** Judges and users can tweak the algorithm weights in real-time using the *Settings* panel to see how different priorities affect the team's score.
3. **Anomaly Detection:** The *Alerts* panel automatically flags sudden spikes in response lag or drops in collaboration, acting as an early-warning system.
4. **Chat with Pulse AI:** An interactive simulated LLM interface that provides natural-language analysis of the team's data over a 6-week period.
5. **D3.js Network Graph:** A beautiful force-directed graph visualizing the strength of team interactions across different pods (Core, Design, Platform).
6. **Auto-Play Narrative Demo:** A single-click presentation mode that auto-advances the timeline to visually demonstrate how the AI detects isolation over a 6-week period.

---

## 🚀 How to Run Locally

This project is built with **Next.js 15**, **React 19**, **Tailwind CSS v4**, and **D3.js**.

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **View the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 The Synthetic Dataset
For this hackathon, we built a highly-detailed synthetic dataset (`team-pulse-seed.json`) tracking a 12-person team over 6 weeks. 

**The Narrative Arc:**
If you use the Timeline Scrubber on the dashboard, you'll notice a deliberate story playing out:
- **Week 0–2:** Healthy baseline. High cross-pod collaboration.
- **Week 3:** A slight dip in 1:1 meetings for the backend team.
- **Week 4–5:** Response lag in the Design pod spikes, and their connections to other pods weaken (isolation risk).
- **Week 5:** The AI flags these issues so the manager can intervene.

---

## 🛠 Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (v4) + Custom Design Tokens (Warm Aesthetic)
- **Visualizations:** D3.js (Force-directed graph)
- **Icons:** Lucide-React / Inline SVGs
- **Deployment:** Vercel

*No real employee data is collected or monitored. This tool aggregates metadata to find patterns, ensuring individual privacy.*
