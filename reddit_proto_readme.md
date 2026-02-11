# Reddit Proto - Multi-Agent Decision Making Machine

## Project Overview

Reddit Proto is a multi-agent system for building, testing, and iterating on Reddit mobile app prototypes through automated UX research cycles. The system optimizes for **WAU on mobile first, then platform-wide DAU** while balancing **best user experience** with **ads revenue and licensing content** business model.

## Main Agent: Orchestrator/Leadership

**Role**: Product manager proxy that coordinates all agents, manages cycles, and escalates blocking decisions.

**Responsibilities**:
- Spin up and coordinate specialized agents
- Auto-prioritize tasks across all agents
- Monitor cycle completion and trigger next cycles
- Generate check-in reports (summary dashboard + broad strokes log)
- Escalate decisions only when blocking cycle progression
- Track budget ($100/month cap for LLM API, Firebase, participant incentives)
- Accept check-ins initiated by PM or provide background updates while working
- Optimize for user experience balanced with business goals (ads revenue, content licensing)

**Check-in Schedule**:
- After each cycle completion
- Daily summary updates
- Immediate escalation for blocking issues
- Available when PM initiates check-ins

**Auto-Escalation Triggers**:
- Any issue preventing cycle continuation
- Budget approaching $100/month
- Severe bugs (P0: blocks participant flow/task success)
- Real participant non-completion after 8 hours

---

## Agent Roles & Requirements

### 1. Architect Agent

**Requirements Source**: PM directives + inferred needs from Prototyper/Developer agents

**Responsibilities**:
- Design and implement system architecture
- Database schema for prototypes, tracking data, research results, participant responses
- API routes and data flow
- Build configuration and deployment pipeline
- Decide when to create shared utilities vs component-specific code
- Plan for future multi-tenancy (not implemented initially)
- Real-time update infrastructure for UXR dashboard

**Technical Stack Decisions**:
- Frontend: React + Next.js (or Vite if preferred)
- Backend: Firebase or similar for real-time capabilities
- Database: Support for time-series tracking data, survey responses, prototype configurations
- PWA configuration for mobile installation
- Authentication: Password-protected internal routes + time-limited tokens for participants
- Reddit API integration for fresh data pulls

**Key Features to Build**:
- Desktop/mobile detection and responsive layouts
- Full-bleed mobile display with PWA installation instructions
- Internal route protection (password: "UIP UX")
- External participant routes with 24-hour token expiration
- Real-time dashboard updates
- Tracking infrastructure (clicks, view duration, drop-off points, device/browser info)

**Customers**: All other agents

---

### 2. Component Developer Agent

**Requirements Source**: Architect + Prototyper agents

**Responsibilities**:
- Build all UI components using Storybook
- Create variants automatically based on prototype needs
- Use Reddit's exact brand colors
- Implement dark mode support from day one
- Ensure WCAG 2.1 AA accessibility compliance
- Fix bugs filed by Prototypers and QA agents
- Maintain component library with clear documentation

**Component Scope**:
- UI primitives: buttons, inputs, cards, modals
- Complex components: comment threads, feed items, post cards, community headers, profile views
- Reddit-specific: upvote/downvote controls, awards, sorting options, filters

**Storybook Setup**:
- Auto-generate variants for each component
- Document props and usage patterns
- Include accessibility tests
- Dark/light mode previews

**Customers**: Architect, Prototyper agents

---

### 3. Prototyper Agents (Multiple)

**Requirements Source**: PM provides main Reddit mobile JSX as template + research results from previous cycles

**JSX Treatment**: Main Reddit mobile JSX is a **canonical reference to enhance** - iterate on it while preserving core Reddit mobile app structure

**Responsibilities**:
- Build 3 prototype variants per cycle
- Test multiple changes together in each variant
- Focus on: Happiness, Adoption, Engagement, Retention, Task Success
- Integrate into UXR dashboard for researcher selection
- Use real Reddit data for feeds, posts, communities (pull fresh each time)
- Create synthetic data for new features not in Reddit API
- Fix bugs filed by QA or discovered during testing
- Iterate based on research results and synthetic participant feedback

**Reddit Data to Pull** (fresh each feed):
- r/all
- r/popular  
- Posts with comments
- Communities
- User profiles

**Prototype Requirements**:
- Mobile-first responsive design
- Desktop fallback with mobile frame
- PWA-installable on mobile browsers
- Full-bleed display on mobile browsers
- Tracking instrumentation for all interactions
- Dark mode support
- WCAG 2.1 AA compliance
- Task success measurement points

**Iteration Triggers**:
- Research results from completed studies
- QA findings
- Synthetic participant data
- PM explicit requests

**Customers**: UXR researchers (via dashboard), QA agent

---

### 4. UXR Dashboard Agent

**Requirements Source**: PM + UXR researcher needs

**Responsibilities**:
- Build researcher dashboard for study configuration
- Enable prototype selection and configuration
- Support visual theming (colors, spacing)
- Allow flow variations (screen order changes)
- Feature flags (show/hide features)
- Content variations (copy, images)
- Custom task definition per study
- A/B test setup automation
- Custom survey question configuration
- Participant quota and recruitment management
- Study pause/resume functionality
- Real-time updates on study progress
- Automated alerts when quotas hit or concerning patterns emerge
- Collaborative features: comments and annotations on results
- LLM-powered summaries of results

**Study Configuration Options**:
- Select prototype variant
- Configure visual treatments
- Define participant flow
- Set tasks for participants
- Create survey questions
- Set quotas (100 participants per experiment default)
- Define success criteria
- Schedule study duration

**LLM Summary Features**:
- Quantitative click patterns + heat maps
- Qualitative survey response analysis
- Cross-prototype comparison
- Drop-off point identification
- Task success rate analysis
- Recommendations for next iteration
- Concerning pattern detection

**Alert Conditions**:
- Study hits participant quota
- Unusual drop-off rates (>30%)
- Task success below threshold (<50%)
- Real participants not completing within 8 hours
- Budget concerns

**Customers**: UXR researchers, PM

---

### 5. Synthetic Participant Agents

**Requirements Source**: PM-defined personas + realistic usage patterns

**Responsibilities**:
- Click through prototypes simulating real user behavior
- Complete surveys with realistic qualitative feedback
- Reach task success for each prototype
- Maintain memory across prototypes as product evolves
- Generate data to refine research process
- Help validate tracking and summary systems

**Persona Definitions**:
- **Power User**: High Reddit usage, familiar with all features, quick navigation, uses advanced features
- **Casual User**: Moderate usage, focuses on browsing r/popular, occasional commenting
- **New to Reddit**: Unfamiliar with Reddit conventions, slower navigation, needs clear guidance
- **Content Creator**: Posts frequently, engages with community, monitors karma and comments
- **Lurker**: Reads extensively, rarely interacts, focused on content consumption

**Demographics per Persona**:
- Age range
- Tech savviness level
- Reddit experience level
- Primary use cases
- Device preferences

**Behavior Patterns**:
- Realistic click sequences
- Variable time on screen
- Natural drop-off points
- Recovery from confusion
- Help-seeking behavior

**Survey Response Quality**:
- Consistent with persona
- Realistic qualitative feedback
- Include both positive and constructive criticism
- Edge case responses when appropriate

**Memory**:
- Track previous prototype experiences
- Evolve expectations as product improves
- Reference previous features in feedback

**Ratio**: All participants are synthetic EXCEPT these real participants:
- jblairmetcalf@gmail.com (Blair Metcalf)
- katie.faulkner@gmail.com (Kate Faulkner)
- alder.metcalf@gmail.com (Alder)

**Real Participant Rules**:
- If no completion within 8 hours, move cycle forward without them
- Track separately from synthetic participants
- Prioritize their feedback in summaries

**Customers**: UXR dashboard, Prototyper agents (via feedback)

---

### 6. QA Agent

**Requirements Source**: Self-directed testing against all platform areas and prototypes

**Responsibilities**:
- Click through platform and all prototypes
- Test with both real Reddit data and synthetic data
- File bugs to Architect and Prototyper agents
- Test accessibility (WCAG 2.1 AA)
- Test dark/light modes
- Test desktop and mobile views
- Test PWA installation and functionality
- Verify tracking accuracy
- Test cross-browser compatibility (Chrome, Safari, Firefox)

**Bug Scope**:
- Functional bugs
- UX issues (confusing flows, poor accessibility)
- Performance problems
- Visual inconsistencies
- Tracking failures
- Dark mode issues
- PWA installation problems

**Bug Severity Levels**:
- **P0 (Blocking)**: Prevents participant from completing flow or reaching task success - BLOCKS DEPLOYMENT
- **P1 (Critical)**: Major functionality broken but workaround exists
- **P2 (Important)**: Degraded experience but not blocking
- **P3 (Minor)**: Polish issues, minor inconsistencies

**Testing Data Sources**:
- Real Reddit data (r/all, r/popular, posts, comments, communities, profiles)
- Synthetic data for new features
- Edge cases (empty states, error states, long content)

**No Testing Required**:
- Network condition simulation (slow 3G, offline)

**Bug Filing**:
- Clear reproduction steps
- Expected vs actual behavior
- Screenshots/recordings
- Severity level
- Affected components/prototypes
- Suggested fix (if obvious)

**Customers**: Architect, Prototyper agents, Component Developer

---

## Cycle Management

### Cycle Definition

A complete cycle includes:
1. Architect designs/updates infrastructure
2. Component Developer builds/fixes components
3. Prototypers create 3 new variants
4. QA tests everything
5. All P0 bugs fixed
6. Synthetic participants complete flows
7. Real participants complete or 8-hour timeout
8. UXR dashboard summarizes results
9. PM reviews and approves (if blocking decision needed)

### Cycle Triggers

**Next Cycle Starts When**:
- All bugs P0 fixed (or escalated for decision)
- Research results available and summarized
- PM approval received (if required)
- Previous cycle learnings incorporated

**Auto-Priority Rules**:
1. P0 bugs (blocking deployment)
2. Real participant issues
3. Budget alerts
4. P1 bugs
5. New prototype development
6. P2/P3 bugs
7. Enhancements

### Success Criteria

**Cycle Success**:
- All prototypes tested by participants
- Task success rate measured
- Survey responses collected
- Results summarized
- No blocking bugs
- Under budget
- Real participants completed or timed out

**Overall System Success** (PM judgment):
- Improving WAU metrics
- Positive participant feedback trends
- Increasing task success rates
- Decreasing cycle time
- Stable, bug-free prototypes

---

## Technical Requirements

### Technology Stack
- **Frontend**: React + Next.js (or Vite)
- **Component Library**: Storybook
- **Backend**: Firebase (or similar real-time DB)
- **Authentication**: JWT tokens for participants, session auth for internal
- **Reddit API**: OAuth integration for data pulls
- **Tracking**: Custom event system with Firebase/similar
- **LLM**: Claude API for result summarization
- **PWA**: Workbox or similar for service workers

### Data Architecture

**Database Collections**:
- `prototypes`: Variant configs, JSX, metadata
- `studies`: Study configs, quotas, tasks, surveys
- `participants`: Real + synthetic participant records
- `sessions`: Participant session tracking
- `events`: Click/interaction tracking (time-series)
- `responses`: Survey responses
- `bugs`: QA filed bugs with status
- `cycles`: Cycle metadata and results
- `comments`: Researcher collaboration

**Data Retention**:
- Reddit data: Pull fresh each time (no caching)
- Tracking data: Indefinite retention
- Participant tokens: 24-hour expiration
- Study data: Indefinite retention

### Authentication & Access

**Internal Access** (password: "UIP UX"):
- All prototypes
- UXR dashboard
- Admin controls
- Bug reports
- Cycle logs

**External Access** (time-limited tokens):
- Specific prototype for specific study
- 24-hour token expiration
- Single-use or reusable based on study config
- Tracking enabled

**API Access**:
- Reddit API with proper rate limiting
- Claude API for summaries
- Firebase real-time listeners

### Real-Time Features

**UXR Dashboard Real-Time Updates**:
- Participant progress
- Live metrics
- Alert notifications
- Collaboration comments
- Study status changes

**Implementation**: WebSockets or Firebase real-time database listeners

---

## Budget & Cost Management

### Monthly Budget: $100

**Cost Breakdown**:
- LLM API (Claude for summaries): ~$40
- Firebase usage: ~$30
- Reddit API: Free (within rate limits)
- Participant incentives: ~$30
- Hosting: ~$0 (use free tiers initially)

**Cost Monitoring**:
- Track daily spend
- Alert at 75% budget ($75)
- Auto-escalate to PM at 90% budget ($90)
- Pause expensive operations at 95% budget ($95)

**Cost Optimization Strategies**:
- Cache LLM summaries for similar studies
- Batch participant tracking data
- Use synthetic participants heavily in early cycles
- Optimize Reddit API calls (batch requests)
- Use Firebase free tier efficiently

---

## Decision Escalation Matrix

### PM Approval Required (Blocking)

- P0 bugs that can't be fixed within cycle
- Budget exceeding $100/month
- Real participant non-completion strategy changes
- Major architectural changes that affect all agents
- Conflicting priorities between business goals and UX

### Autonomous Agent Decisions

- P1/P2/P3 bug fixes
- Component variant creation
- Prototype iteration designs
- Study configuration options
- Synthetic participant behavior
- QA test coverage
- API optimization
- Code refactoring
- Storybook organization

### Escalation Format

When escalating to PM:
1. **Problem Statement**: What's blocking the cycle?
2. **Context**: Why can't agents resolve autonomously?
3. **Options**: 2-3 possible solutions with pros/cons
4. **Recommendation**: Agent's suggested path with reasoning
5. **Impact**: Effect on timeline, budget, metrics
6. **Required by**: Deadline for decision

---

## Check-In Reports

### Format: Summary Dashboard + Broad Strokes Log

**Summary Dashboard** (visual):
- Current cycle status
- Active tasks by agent
- Bug counts by severity
- Budget spend (current/remaining)
- Participant completion rates
- Key metrics trends (WAU, DAU, task success)
- Blocking issues highlighted

**Broad Strokes Log** (text):
- Major accomplishments since last check-in
- Key decisions made autonomously
- Issues resolved
- Issues escalated
- Next priorities
- Resource usage
- Timeline updates

### Check-In Triggers

1. **After Each Cycle**: Full summary + log
2. **Daily**: Brief status update (background while working)
3. **PM-Initiated**: On-demand detailed report
4. **Blocking Issues**: Immediate escalation with context

---

## Communication Protocols

### Agent-to-Agent

- **Bug Reports**: Structured format with severity, reproduction steps, assignment
- **Feature Requests**: From Prototypers → Component Developer with priority
- **Architecture Needs**: From any agent → Architect with use case
- **Cycle Completion**: All agents → Orchestrator with status
- **Blockers**: Any agent → Orchestrator with escalation request

### Agent-to-PM

- **Check-Ins**: Scheduled or on-demand via Orchestrator
- **Escalations**: Blocking issues with options
- **Budget Alerts**: Automated at thresholds
- **Participant Issues**: Real participant non-completion
- **Metric Alerts**: Concerning trends in research data

### PM-to-Agents

- **Requirements**: Via Orchestrator to relevant agents
- **Approvals**: Decision on escalated items
- **Priorities**: Business goal shifts or metric targets
- **Check-In Requests**: Ad-hoc status requests
- **Cycle Kickoffs**: New round of prototypes

---

## Getting Started

### Initial Setup (Orchestrator)

1. Spin up Architect agent → design system architecture
2. Spin up Component Developer → set up Storybook and base components
3. Receive main Reddit mobile JSX from PM
4. Spin up first Prototyper agent → create initial 3 variants
5. Spin up UXR Dashboard agent → build researcher interface
6. Spin up QA agent → begin testing
7. Spin up Synthetic Participant agents → 5 personas minimum
8. Configure authentication and access controls
9. Set up Reddit API integration
10. Initialize tracking infrastructure
11. Create first study in UXR dashboard
12. Run first cycle

### First Cycle Goals

- Functional prototypes deployed
- Real participants invited (Blair, Kate, Alder)
- Synthetic participants complete flows
- Tracking data collected
- Survey responses gathered
- LLM summaries generated
- Bug reports filed and triaged
- Under budget
- Check-in report delivered to PM

### Continuous Operation

- Monitor all agents
- Auto-prioritize tasks
- Escalate only blocking issues
- Generate daily summaries
- Optimize for cycle speed and quality
- Track budget continuously
- Incorporate learnings into next cycle
- Balance user experience with business goals

---

## Success Metrics

### Primary Metrics (Business Goals)
- **WAU on mobile** (primary target)
- **Platform-wide DAU** (secondary target)
- **Ads revenue indicators** (engagement with ad surfaces)
- **Content licensing opportunities** (viral content, cross-posting)

### UX Research Metrics
- **Task Success Rate**: % participants completing defined tasks
- **Happiness**: Survey scores, sentiment analysis
- **Adoption**: First-use metrics, feature discovery
- **Engagement**: Time on platform, interactions per session
- **Retention**: Return visits, repeat usage patterns

### System Health Metrics
- **Cycle Time**: Days to complete full cycle
- **Bug Velocity**: Time from bug filed to fixed
- **Participant Completion**: % completing within 8 hours
- **Budget Efficiency**: Cost per research insight
- **Agent Collaboration**: Smooth handoffs, minimal escalations

---

## Appendix: Main Reddit Mobile JSX

**PM to provide**: The canonical Reddit mobile app JSX that serves as the starting point for all prototype iterations. Prototypers will enhance this while preserving core mobile Reddit structure.

**Source File Location**: [To be provided by PM]

---

## Questions & Support

**For blocking issues**: Escalate to PM via Orchestrator with options and recommendation

**For agent coordination**: Orchestrator auto-prioritizes and routes

**For budget concerns**: Automated alerts at 75%, 90%, 95% thresholds

**For technical questions**: Architect agent provides guidance

**For UX questions**: Prototyper agents consult research results and business goals

---

**Version**: 1.0  
**Last Updated**: [Current Date]  
**Project Lead**: PM (via Orchestrator)  
**Business Goals**: WAU mobile → DAU platform-wide, balanced with best UX + ads revenue + content licensing