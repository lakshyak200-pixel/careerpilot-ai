# CareerPilot AI

Modern, professional, and responsive AI-powered career guidance platform built specifically for college students and fresh graduates.

## Tech Stack

- **React 19** + **Vite**
- **Tailwind CSS v4** (Modern `@tailwindcss/vite` engine)
- **React Router v7** (Nested layout routing, code-split lazy loading with Suspense)
- **Lucide React** (Consistent modern icon system)
- **Framer Motion** (Smooth transitions, stagger animations, accordion interactions)

---

## Color Scheme

- **Navy Blue**: `#0a1744` / `#050d2e` (Deep backgrounds, text, and authority)
- **Pure White**: `#ffffff` (Clean SaaS-style card surfaces and typography)
- **Brand Purple**: `#7c3aed` / `#6d28d9` (Gradients, primary call-to-actions, badges, and focus rings)

---

## Implemented Pages & Routes

1. **Landing Page** (`/`):
   - Hero banner with headline: *"Build Your Career with AI"*
   - 4 Feature Cards: AI Resume Analysis, Skill Gap Detection, Mock Interviews, and Personalized Roadmaps
   - How it works 3-step breakdown
   - Real student proof metrics & testimonials
   - Sticky navbar & comprehensive footer

2. **Login Page** (`/login`):
   - Split-screen layout with branding artwork and student sign-in form
   - Email, password (with show/hide toggle), remember me, social login buttons
   - Direct link into the Dashboard

3. **Registration Page** (`/register`):
   - University student onboarding form
   - Full name, university email, college name, graduation year selector, password with real-time visual strength meter

4. **Student Dashboard** (`/dashboard`):
   - Welcome banner with student name and graduation track
   - 4 Top Metric Cards (ATS Resume Score 78/100, 12/18 Skills Matched, 5 Mock Interviews, 45% Roadmap Milestone)
   - Quick Action links to all tools
   - Recent activity audit feed & prioritized next tasks

5. **Upload Resume Page** (`/dashboard/upload-resume`):
   - Interactive drag-and-drop file upload zone (PDF, DOCX, TXT)
   - Parsing progress indicator and selected file preview
   - Table of previously scanned resumes
   - ATS optimization tips sidebar

6. **Resume Analysis Page** (`/dashboard/resume-analysis`):
   - Circular gauge overall ATS score (78/100)
   - 4 Dimension breakdown bars (Content, Formatting, Keywords, Impact)
   - Interactive accordion cards: Key Strengths, Recommended Enhancements, Critical Flags
   - Detected Keywords vs Missing Keywords tag clouds
   - PDF report export and re-upload triggers

7. **Skill Gap Analysis Page** (`/dashboard/skill-gap`):
   - Role selector (Frontend, Backend, Full Stack)
   - Role Match percentage donut (68% for Frontend)
   - Visual comparison matrix with colored bars (Target Met, Minor Gap, Priority Gap)
   - Curated learning modules for identified missing skills

8. **AI Mock Interview Page** (`/dashboard/mock-interview`):
   - Session setup panel (Role, Difficulty, Format)
   - Real-time simulation chat stream with AI interviewer and student answers
   - Inline score and coaching tips for each answer
   - Timer countdown and question counter
   - Historical interview performance table

9. **Learning Roadmap Page** (`/dashboard/roadmap`):
   - 4-Phase timeline (Fundamentals, Core React, QA/Testing, Placement Sprint)
   - Expandable milestones with interactive checkbox toggles
   - Estimated hours and external documentation links
   - Recommended certified courses sidebar

10. **Profile & Settings Page** (`/dashboard/profile`):
    - Two-column layout with student avatar card and graduation details
    - 4 tabbed management panes: Personal Information, Career Preferences, Notification Toggles, and Security/Password Management

---

## FastAPI & Supabase Integration Architecture

This frontend is configured with explicit integration notices and clean state management:
- **Authentication**: Ready to hook into `supabase.auth.signInWithPassword()` and `supabase.auth.signUp()`.
- **Resume Upload**: Wired to post `FormData` to FastAPI `POST /api/resume/analyze`.
- **Skill Gaps**: Prepared for FastAPI `GET /api/skills/benchmark?role={role}`.
- **Mock Interviews**: Compatible with FastAPI SSE or WebSockets (`/api/interview/session`).

---

## Getting Started

```bash
# Navigate to the project directory
cd careerpilot-ai

# Start the development server
npm run dev

# Build for production
npm run build
```
