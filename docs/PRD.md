# DayCraft: Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | DayCraft |
| **Brand** | Whitraworks |
| **Owner** | Project owner (sole decision-maker) |
| **Status** | Approved v1 scope · not yet implemented |
| **Last updated** | 2026-10-15 |

> **What this document is:** the single source of truth for **what** DayCraft does and **why**.
> **What it is not:** technical design (see [ARCHITECTURE.md](ARCHITECTURE.md)), security rules (see [SECURITY.md](../SECURITY.md)), or current status (see [PROGRESS.md](PROGRESS.md)).
> **History:** derived from [the original requirements](archive/PROJECT_REQUIREMENTS.md) and the decisions in [the original analysis, §12](archive/PROJECT_UNDERSTANDING.md). If anything here conflicts with those files, **this PRD wins**.
> **Changing this document:** any change to scope or behaviour requires the owner's approval and an entry in [§12 Change log](#12-change-log).

---

## 1. Vision and goals

**DayCraft** is a productivity web app that helps people plan their day, keep track of deadlines and the people they're waiting on, focus on what matters most, and see their work on a board. It works alone or with a team. Each person's personal data is strictly private.

The project has **two equal goals**:

1. **A real product:** anyone can register at `https://daycraft.whitraworks.online` and use it safely in production.
2. **Learning:** the owner practises the full software lifecycle end to end, as preparation for a Forward Deployed Engineer role. This covers requirements, design, frontend, backend, database, security, Docker, CI/CD, infrastructure, domains, and operations.

### Success criteria (v1)
- A new user can register, verify their email, and plan a real day using the four basic features, on a phone and on a desktop.
- A user can create a team, invite a colleague by email, and both can work on team tasks. The colleague can never see the user's personal items.
- Every change reaches production only through the automated pipeline, and every deploy is verified automatically.

---

## 2. Users

| User | Description |
|---|---|
| **Individual user** | Registers to manage their own work. Uses only their Personal space. |
| **Team Owner** | An individual user who creates a Team space and invites others. |
| **Team Admin / Member** | A user invited into a Team space with a role (see §5). |
| **Visitor** | Not logged in. Can only see the login, registration, password reset, and invitation pages. |

Out of scope for v1: a platform-wide admin panel (see §11).

---

## 3. Core concepts

### 3.1 Spaces
- Every item (task, follow-up, board column, …) belongs to **exactly one space**.
- Every user automatically gets one **Personal space** when they register. A Personal space **can never have other members**.
- A user can **create** and **join** multiple **Team spaces**.
- **Access rule:** a user can see or change an item only if they are a member of that item's space and their role allows the action. This is enforced on the server for every request.
- The sidebar has a **space switcher** for moving between spaces.

### 3.2 One task, many views
There is **one task model**. The Planner, Deadlines, Focus, and Kanban are **different views of the same tasks**. Completing a task in any view completes it everywhere.

### 3.3 Shared data vs per-user data
| Shared with the task's space | Personal to each user |
|---|---|
| Title, notes, checklist, priority, status/column, due date and time, assignee, follow-up details | "Planned for date X" (Planner), "focus task today" (Focus), focus sessions |

So when two team members look at the same team task, they see the same due date. Each of them can plan it for a different day, or mark it as a focus task, without affecting the other.

### 3.4 Feature classification
| Feature | Type | Status |
|---|---|---|
| Smart Daily Planner | Basic, always on | v1 |
| Deadline & Follow-up Tracker | Basic, always on | v1 |
| Focus-Based Task Manager | Basic, always on | v1 |
| Drag-and-Drop Kanban | Basic, always on | v1 |
| Teams & invitations | Core | v1 (after the basic features) |
| Monthly Expense Tracker | Optional (user enables it) | Deferred |
| Productivity Insights & Habit Tracker | Optional (user enables it) | Deferred |
| Real-time live updates (formerly "Real-Time Collaborative To-Do") | Optional | Deferred |

---

## 4. Authentication and account

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AUTH-01 | Register with name, email, password | Duplicate emails are rejected. Weak passwords are rejected with a clear message. On success, a Personal space and default settings are created and the user is logged in. |
| AUTH-02 | Log in / log out | Wrong credentials give a generic error (*"Invalid email or password"*). Logout ends the session on the server. |
| AUTH-03 | Secure passwords | Passwords are never stored or logged in readable form (details in SECURITY.md). |
| AUTH-04 | Login protection | Repeated failed logins are rate-limited. |
| AUTH-05 | Welcome milestone | The first deployed version of the home page shows **"Hey, {name}!"** for the logged-in user. It is replaced later by the Planner's Today view. |
| AUTH-06 | Soft email verification | Users can use the app immediately. A banner asks them to verify until they do. **Unverified users cannot create teams or send invitations.** Users who join through an invitation are verified automatically. |
| AUTH-07 | Forgot / reset password | Sends a single-use link that **expires in 30 minutes**. A successful reset **logs out all other sessions**. |
| AUTH-08 | Change password | Requires the current password. **Logs out all other sessions.** |
| AUTH-09 | Email is permanent | Users **cannot change** their email address. Settings shows it read-only. |
| AUTH-10 | Time zone | Detected from the browser at registration. Editable in Settings. Used for "today", deadlines, and streaks. |
| AUTH-11 | Data isolation | A user can never read or change another user's Personal space data, through the UI or directly through the API. |
| AUTH-12 | Password policy | Minimum **6** characters (maximum 128), with at least **1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character**. Passwords on a common-password blocklist are rejected. The registration, reset, and change-password forms show a **live checklist** of the rules. Applies wherever a password is set. ⚠️ **Accepted risk (owner decision):** 6 is below the OWASP/NIST minimum of 8. Revisit before public launch. Agents must not change this without the owner's approval. |

---

## 5. Teams, roles, and invitations

### 5.1 Roles
| Permission | Owner | Admin | Member |
|---|---|---|---|
| View, create, and edit team tasks | ✅ | ✅ | ✅ |
| Invite, resend, and revoke invitations | ✅ | ✅ | ❌ |
| Remove members / change roles | ✅ | ✅ (but not the Owner) | ❌ |
| Team settings (name, logo, Kanban columns) | ✅ | ✅ | ❌ |
| View the team audit log | ✅ | ✅ | ❌ |
| Delete the team | ✅ | ❌ | ❌ |

Each team has exactly **one Owner**, the user who created it.

### 5.2 Requirements
| ID | Requirement | Acceptance criteria |
|---|---|---|
| TEAM-01 | Create a team | Any **verified** user can create multiple teams and becomes the Owner. |
| TEAM-02 | Invite by email | The Owner or an Admin enters an email and a role. The invitation is **single-use**, **bound to that email**, and **expires after 7 days**. |
| TEAM-03 | Accept (new user) | The invite link opens registration with the email **pre-filled and locked**. After registering, the user joins the team and is automatically verified. They also get their own Personal space. |
| TEAM-04 | Accept (existing user) | The user logs in, sees *"Join {team}?"*, and accepts. |
| TEAM-05 | Wrong account | If the logged-in user's email doesn't match the invitation, it is refused with a clear message. |
| TEAM-06 | Manage invitations | The Owner or an Admin can see pending invitations and resend or revoke them. |
| TEAM-07 | Remove member / leave | A removed or departed member loses access **immediately**. Tasks they created stay in the team. |
| TEAM-08 | Assigned tasks | Team tasks can be assigned to a member. Team tasks assigned to a user appear in that user's Planner, Deadlines, and Focus views, with a space label. |
| TEAM-09 | Move between spaces | Personal → Team is allowed after a confirmation (*"This will be visible to the team"*). Team → Personal is allowed **only for the Owner or an Admin**. |
| TEAM-10 | Simultaneous edits | Data refreshes when the window regains focus, when navigating, and about every 30 seconds. If two people edit the same task at once, the second save is **detected and refused** with a message to reload, never silently overwritten. |

---

## 6. Basic features

### 6.1 Tasks (shared by all views)
| ID | Requirement |
|---|---|
| TASK-01 | A task has a title, optional notes, an optional checklist, a priority (**Urgent / High / Medium / Low**), a status (its Kanban column), an optional due date and optional due time, an optional assignee (teams only), and optional follow-up details (see §6.3). |
| TASK-02 | Create, edit, complete, reopen, and delete tasks. Completing a task in any view completes it everywhere. |
| TASK-03 | Clicking a task in any view opens its full details in a **side panel**. |

### 6.2 Smart Daily Planner (home page)
| ID | Requirement | Acceptance criteria |
|---|---|---|
| PLAN-01 | Today view | Shows the tasks this user planned for today, from their Personal space and from team tasks assigned to them, each with a space label. The order can be changed by dragging. |
| PLAN-02 | Quick add | Typing a title and pressing Enter creates a task planned for today in the current space. |
| PLAN-03 | Carry-over | Unfinished tasks from earlier days appear in a *"Still open from earlier"* box with **Move to today / Pick a date / Unschedule**. **Nothing moves without the user choosing.** |
| PLAN-04 | Time estimates | Tasks can have an optional estimate. The header shows *"Planned: Xh Ym"* against **available hours** (default **8 h**, set in Settings). |
| PLAN-05 | Plan other days | A date picker shows and plans any other day. |
| PLAN-06 | Smart hints (rule-based, no AI) | Dismissible hints: more time planned than available; tasks due tomorrow that aren't planned; overdue tasks; no focus tasks picked today. Each hint has an action button. |

### 6.3 Deadline & Follow-up Tracker
| ID | Requirement | Acceptance criteria |
|---|---|---|
| DEAD-01 | Grouped deadlines | Groups: **Overdue · Today · This week · Later · Recently completed**. Grouping uses the user's time zone. |
| DEAD-02 | Filters | By space (Personal / a team / all) and by assignee (me / everyone). |
| DEAD-03 | Quick actions | **Done · Snooze to tomorrow · Change date · Plan for today**. |
| DEAD-04 | Overdue badge | The sidebar shows the number of overdue items. |
| FOLL-01 | Follow-ups | A follow-up records something the user is **waiting for**: *what*, *waiting on* (free text, or a team member in team spaces), *follow-up date*, and optional notes. |
| FOLL-02 | Follow-up tabs | **Due to follow up · Waiting · Resolved**. |
| FOLL-03 | Follow-up actions | **Resolved**, or **Followed up** (set the next date). Each follow-up keeps a history of when the user followed up. |
| FOLL-04 | Reminders (v1) | **In-app only:** sidebar badges and a highlighted section on the Today page. The daily email digest is deferred. |

### 6.4 Focus-Based Task Manager
| ID | Requirement | Acceptance criteria |
|---|---|---|
| FOCUS-01 | Today's Focus | Each user picks **at most 3** focus tasks per day. Focus tasks are **not** carried over automatically; yesterday's are offered as suggestions. |
| FOCUS-02 | Focus timer | Pomodoro-style: **25 min focus / 5 min break / 15 min long break after 4 sessions**, all adjustable in Settings. Pause, resume, and stop are available. Stopping early still records the time worked. |
| FOCUS-03 | Reliable timing | The timer stays correct after switching tabs, refreshing the page, or the device sleeping. |
| FOCUS-04 | One session at a time | Starting a new session asks before ending the current one. |
| FOCUS-05 | End of session | A gentle sound, plus an optional browser notification if the user has allowed notifications. |
| FOCUS-06 | Focus Mode | A full-screen, distraction-free view: the task title, notes and checklist, a large timer, and **Done / Pause / Exit**. |
| FOCUS-07 | History | Every session is saved (task, start, end, minutes). A daily summary shows, e.g. *"Today: 1h 50m focused · 4 sessions"*. |

### 6.5 Kanban
| ID | Requirement | Acceptance criteria |
|---|---|---|
| KAN-01 | One board per space | Default columns: **To Do · In Progress · Done**. |
| KAN-02 | Custom columns | Add, rename, reorder, and delete columns (only the Owner or an Admin in team spaces). Each column has a category: **Not started / In progress / Done**. |
| KAN-03 | Completion via category | Dropping a card into any **Done**-category column completes the task everywhere. Moving it out reopens it. |
| KAN-04 | Safe column delete | A column can only be deleted when it is empty. The user is prompted to move its cards first. |
| KAN-05 | Cards | Show the title, priority marker, due date (red when overdue), follow-up icon, assignee avatar (teams), and checklist progress (e.g. `2/5`). |
| KAN-06 | Drag and drop | Works with mouse, touch, and keyboard. Cards move instantly; if saving fails, the card returns to its place with a message. |
| KAN-07 | Mobile | Columns become horizontally swipeable, one column per screen. |
| KAN-08 | Quick add and filters | Add a card at the top of any column. Filter by assignee, priority, due date (overdue / this week), and text. |

---

## 7. App shell, settings, and personalization

### 7.1 Layout
| ID | Requirement |
|---|---|
| UI-01 | Responsive across **desktop, tablet, and mobile**. On mobile the sidebar becomes a drawer. |
| UI-02 | **Sidebar:** space switcher, the space's logo and display name, the basic features, and any optional features the user has enabled. |
| UI-03 | **Top bar:** page title, light/dark toggle, user menu (Settings, Logout). |
| UI-04 | **Look and feel:** "super and modern". Polished, clean spacing, smooth transitions, a carefully designed dark mode, and consistent reusable components. Details live in DESIGN.md (Phase 7). |
| UI-05 | Footer or about text: **"DayCraft by Whitraworks"**. |

### 7.2 Account settings (per user)
| ID | Requirement |
|---|---|
| SET-01 | **Basic information:** name and phone are editable. Email is read-only. |
| SET-02 | **Change password** (see AUTH-08). |
| SET-03 | **Theme colour**, one of 7: **Black (default)**, Blue, Green, Purple, Teal, Orange, Rose. Saved to the account so it follows the user to every device. |
| SET-04 | **Mode:** Light / Dark / **System (default)**. |
| SET-05 | **Time zone**, **available hours per day**, and **focus timer durations**. |
| SET-06 | **Personal audit log** (see §8). |

### 7.3 Space settings (per space)
| ID | Requirement |
|---|---|
| SPACE-01 | **Display name and logo.** Defaults: the Personal space shows "DayCraft" with the DayCraft logo; a team shows its team name with the DayCraft logo. An uploaded logo replaces the default in the sidebar and can be changed at any time. |
| SPACE-02 | Logo uploads accept images only, with a size limit (rules in SECURITY.md). |
| SPACE-03 | Team spaces also have **Members, Invitations, Kanban columns, and Team audit log** (Owner and Admin only). |

### 7.4 Optional feature management
| ID | Requirement |
|---|---|
| OPT-01 | Basic features are always on and cannot be disabled. |
| OPT-02 | Each optional feature can be enabled or disabled in Settings. New users start with **all optional features off**. |
| OPT-03 | Enabling a feature shows it in the sidebar. Disabling it hides it from the sidebar and blocks its pages and API, but **never deletes its data**. Re-enabling restores everything. |
| OPT-04 | The toggle UI ships together with the **first optional feature**. Until then there is nothing to toggle. |

---

## 8. Audit log

| ID | Requirement |
|---|---|
| AUD-01 | **What is recorded.** Security: register, login success/failure, logout, password changed/reset, email verified. Account: name/phone changes, theme/mode changes, timer settings. Spaces: create/rename/delete, logo changes, Kanban column changes. Membership: invitation sent/resent/revoked, member joined, role changed, member removed, member left. Tasks: create, delete, complete/reopen, moved between spaces, assignee changed, due date changed. |
| AUD-02 | **Never recorded:** passwords, tokens, invitation links, session IDs. |
| AUD-03 | **Each entry stores:** who did it, the action, the item (type, ID, name), old → new values, the time, and the IP address and browser (security events only). |
| AUD-04 | **Who can see what:** each user sees their own account events and their Personal space's events. A team's Owner and Admins see that team's events. Members do not. |
| AUD-05 | **Append-only:** nobody can edit or delete entries through the app. |
| AUD-06 | **Retention:** entries older than **12 months** are deleted automatically. |
| AUD-07 | **Display:** a readable timeline (e.g. *"Ravi moved 'Prepare invoice' from To Do to Done · 2h ago"*), expandable details, and filters by date, event type, and person. |

---

## 9. Email

| ID | Requirement |
|---|---|
| MAIL-01 | Emails sent in v1: **email verification, password reset, team invitation**. |
| MAIL-02 | Sender: `DayCraft <no-reply@whitraworks.online>`. Emails are authenticated so they don't land in spam. |
| MAIL-03 | Deferred: a **daily digest** of due items, overdue items, and follow-ups (one email per day, never one per task). |

---

## 10. Non-functional requirements

| Area | Requirement |
|---|---|
| **Security and privacy** | Strict data isolation (AUTH-11, §3.1). Full rules in [SECURITY.md](../SECURITY.md). |
| **Availability** | Single server. Short downtime (seconds) during deploys is acceptable in v1. Nightly off-server backups. The frontend stays online and shows a friendly message if the API is down. |
| **Time** | All dates and times are stored in UTC and displayed in the user's time zone. |
| **Responsiveness** | Every page works on mobile, tablet, and desktop. |
| **Accessibility** *(proposed, see §13)* | Target WCAG 2.2 AA: keyboard navigation, visible focus, sufficient colour contrast in all 7 themes × light/dark. |
| **Browser support** *(proposed, see §13)* | The latest two versions of Chrome, Edge, Firefox, and Safari, plus mobile Safari and Chrome. |
| **Language** | English only in v1. |

---

## 11. Out of scope and deferred

| Item | Status |
|---|---|
| Monthly Expense Tracker | Deferred. Supported currencies: INR, USD, EUR (other details decided at that phase) |
| Productivity Insights & Habit Tracker | Deferred |
| Real-time live updates in team spaces | Deferred |
| Daily email digest | Deferred (after Teams) |
| AI planning suggestions | Deferred |
| Eisenhower matrix view | Deferred |
| Multiple boards per space | Deferred |
| Viewer role, platform-admin panel | Deferred |
| Changing email address | Not supported (owner decision) |
| Recurring tasks, mobile apps, other languages | Not planned |

---

## 12. Change log

| Date | Change | Approved by |
|---|---|---|
| 2026-10-15 | Initial PRD created from the original requirements and the approved decisions (Q1–Q16) | Owner |
| 2026-10-15 | PRD reviewed and approved. OQ-4: supported currencies INR, USD, EUR | Owner |
| 2026-10-15 | OQ-5: password policy AUTH-12 (minimum 6, upper/lower/digit/special, blocklist), recorded as an accepted risk | Owner |

---

## 13. Open questions

These need the owner's decision before the phase that needs them. Recommended defaults are in brackets.

| # | Question | Needed by |
|---|---|---|
| OQ-1 | Are follow-ups **tasks marked "waiting"** (so they also appear on the Kanban board with an icon), or a **separate list**? [Tasks marked "waiting": one model, consistent with "one task, many views"] | Phase 10 |
| OQ-2 | Accessibility target **WCAG 2.2 AA** and the browser support list in §10: accept? [Accept] | Phase 7 |
| OQ-3 | **Account deletion and data export:** needed in v1 for privacy? [Add deletion before public launch; export later] | Before public launch |
| OQ-4 | ~~Expense Tracker currency~~ **Partly resolved:** supported currencies are **INR, USD, EUR**. Still open: one currency per user or a choice per expense, and the default currency. | Expense phase |
| OQ-5 | ~~Password rules~~ **Resolved:** see AUTH-12 (minimum 6 + composition rules, accepted risk). | — |
| OQ-6 | Revisit the password minimum length (AUTH-12 accepted risk) | Before public launch |
