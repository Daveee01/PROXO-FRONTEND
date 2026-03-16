# Project Proposal: GreenSight AR

## 1. Executive Summary
GreenSight AR is an interactive WebXR platform that helps users visualize and place climate-appropriate trees in real-world spaces using augmented reality. The system combines immersive AR visualization, AI-guided tree recommendations, and environmental impact metrics to transform environmental education into actionable behavior.

The current prototype demonstrates an end-to-end user journey: launching from a gamified landing page, scanning surroundings, receiving AI-ranked species recommendations, placing a tree in AR, and viewing measurable impact (CO2 absorption, oxygen generation, and water retention). GreenSight AR is designed for schools, communities, municipalities, and sustainability campaigns that need an engaging way to promote urban greening.

## 2. Problem Statement
Urban communities face three recurring barriers in tree-planting initiatives:

1. Low engagement: Most awareness campaigns fail to convert interest into action.
2. Low confidence: Citizens are unsure which species fit their environment.
3. Low visualization: People cannot easily imagine the impact of planting decisions in their own spaces.

As a result, many initiatives remain educational only, with limited behavior change.

## 3. Proposed Solution
GreenSight AR solves this through a mobile-first AR experience that makes planning tangible and personalized:

1. Immersive placement: Users place realistic 3D trees in their physical environment using camera and WebXR.
2. AI recommendations: The app ranks suitable trees and explains why each species matches.
3. Instant impact feedback: Users immediately see environmental metrics per tree.
4. Gamified interaction: Progress cues, achievements, and social-style statistics increase retention.

This creates a clear path from curiosity to informed planting decisions.

## 4. Objectives
Primary objectives for the competition cycle:

1. Increase awareness and participation in local tree-planting.
2. Improve confidence in species selection through explainable recommendations.
3. Provide transparent impact visualization for education and advocacy.
4. Build a scalable web platform accessible without app-store installation.

## 5. Innovation and Differentiation
GreenSight AR is differentiated by combining education, simulation, and decision support in one lightweight web experience.

1. WebXR-first architecture: Runs in modern browsers with no native app dependency.
2. Explainable recommendation UX: Users receive ranked species plus textual rationale.
3. Dual-mode AR strategy: Supports immersive AR where available, with graceful fallback camera/3D mode.
4. Human-centered impact framing: Environmental benefits are shown in immediate, understandable units.
5. Competition-ready UX: Gamified visual language increases motivation and repeat usage.

## 6. Technical Architecture
### 6.1 Stack
1. Frontend framework: Next.js (App Router) + React + TypeScript.
2. 3D and AR: Three.js with @react-three/fiber and @react-three/xr.
3. UI system: Tailwind CSS + Radix UI-based components.
4. Deployment model: Static/server-rendered web application compatible with modern cloud hosting.

### 6.2 Core Modules
1. Landing Experience Module
   - Gamified onboarding, hero storytelling, and conversion-focused CTA.
2. AR Capture and Scanning Module
   - Camera access, scanning simulation/progress, environment readiness flow.
3. Recommendation Module
   - Ranked tree list with match scores and explainable reasons.
4. Tree Detail and Impact Module
   - Species profile and per-year impact metrics (CO2, oxygen, water retention).
5. AR Placement Module
   - Screen-tap placement fallback and immersive WebXR fixed-pose placement.
6. Session and Interaction State Module
   - UI flow control for scan, recommendation, placement, and post-placement insight.

### 6.3 Reliability and Compatibility
1. Browser capability detection for immersive AR support.
2. Graceful degradation when camera/XR is unavailable.
3. Mobile-first interaction model for touch and gesture inputs.

## 7. Target Users and Use Cases
### 7.1 Primary Users
1. Students and educators in environmental programs.
2. Community volunteers and youth groups.
3. Local government and NGO sustainability teams.
4. Homeowners and urban residents interested in greening.

### 7.2 Use Cases
1. School sustainability workshops.
2. Community tree-planting drives.
3. Public awareness campaigns for climate action.
4. Pre-planting planning for parks and neighborhoods.

## 8. Expected Impact
### 8.1 Environmental
1. Better species awareness and placement planning.
2. Increased participation in local tree initiatives.
3. Improved communication of long-term ecological benefits.

### 8.2 Social and Educational
1. Higher climate literacy through interactive learning.
2. Stronger youth engagement via game-like interfaces.
3. Easier stakeholder communication using visual simulations.

### 8.3 Product KPIs (Pilot)
1. User completion rate from onboarding to AR placement.
2. Recommendation click-through and selection rate.
3. Average session duration and repeat visits.
4. Number of simulated trees placed per session.

## 9. Implementation Plan
### Phase 1: Prototype Stabilization (2-3 weeks)
1. Finalize UI/UX polish and accessibility checks.
2. Improve AR placement reliability across browsers.
3. Add analytics for user journey tracking.

### Phase 2: Pilot Deployment (3-4 weeks)
1. Launch pilot with one school/community partner.
2. Collect behavior and usability feedback.
3. Validate recommendation explanation clarity.

### Phase 3: Scale and Integrate (4-6 weeks)
1. Expand species database and localized content.
2. Add user accounts and saved planting plans.
3. Integrate map/location context for regional recommendations.

## 10. Risk Assessment and Mitigation
1. Device/browser fragmentation
   - Mitigation: Feature detection, fallback rendering, and compatibility testing matrix.
2. Camera/XR permission friction
   - Mitigation: Clear permission prompts and preview mode without camera dependence.
3. Recommendation trust and transparency
   - Mitigation: Explainable rationale text and visible match scoring.
4. Engagement drop after first session
   - Mitigation: Challenges, achievements, and community campaign integration.

## 11. Sustainability and Future Expansion
1. Data-driven recommendation engine using real environmental datasets.
2. Multi-language support for broader community adoption.
3. Municipal dashboard for campaign planning and reporting.
4. Partnerships with schools, NGOs, and CSR programs.

## 12. Team and Governance
Recommended competition team structure:

1. Product Lead: Vision, partnerships, and pilot operations.
2. Technical Lead: Architecture, AR performance, and deployment.
3. AI/Data Lead: Recommendation model and data integrity.
4. Design and Outreach Lead: UX narrative, accessibility, and communication.

## 13. Resource Requirements
### 13.1 Technology
1. Cloud hosting for Next.js application.
2. Analytics and monitoring tools.
3. Source control and CI workflow.

### 13.2 Human Resources
1. Frontend/AR engineer.
2. UX designer.
3. Data/AI contributor.
4. Project coordinator for pilot stakeholders.

### 13.3 Estimated Budget (Pilot-Scale)
1. Hosting and services: USD 300-700.
2. Design and testing: USD 500-1,500.
3. Outreach and pilot operations: USD 500-2,000.
4. Total pilot envelope: USD 1,300-4,200.

## 14. Competition Value Proposition
GreenSight AR aligns strongly with climate-tech and social-impact competition criteria:

1. Innovation: Practical WebXR + AI decision support.
2. Feasibility: Functional prototype with modern, production-capable stack.
3. Scalability: Web delivery enables low-friction distribution.
4. Impact: Clear climate education and behavior-change pathway.

## 15. Conclusion
GreenSight AR turns tree planting from an abstract concept into a personalized, measurable, and interactive experience. By combining AR visualization with explainable recommendations and impact metrics, the project enables communities to make better environmental decisions and motivates real-world climate action.

---

## Appendix A: Current Prototype Features
1. Animated onboarding and gamified landing page.
2. Camera-based AR view and immersive WebXR session support.
3. AI-style recommendation cards with ranked species and match scores.
4. Species detail panel with environmental impact metrics.
5. AR placement confirmation flow with post-placement impact highlights.

## Appendix B: Suggested Submission Assets
1. This written proposal.
2. 1-2 minute product demo video.
3. Slide deck (10-12 slides) with architecture and impact model.
4. Pilot plan and KPI measurement sheet.
