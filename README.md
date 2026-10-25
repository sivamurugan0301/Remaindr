# ⏱️ TimeFlow - Task & Alert Scheduler

TimeFlow is a clean, elegant, and user-friendly Task & Alert Scheduler built with **Java 21**, **Spring Boot 3**, **Spring Data JPA**, **H2 In-Memory Database** (with a clean **PostgreSQL** schema), **React (Vite)**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🌟 Key Highlights & Channels

### 1. 💬 WhatsApp Message
- **Inputs**: Recipient phone number, message body, scheduled date & time.
- **Dispatcher**: Java service sending via Twilio WhatsApp API (mocked by default with realistic SID generation, status tracking, and console logging).

### 2. 📱 Normal SMS
- **Inputs**: Recipient mobile number, short message text, scheduled date & time.
- **Dispatcher**: Java service dispatching regular mobile SMS texts via Twilio SMS API (mocked with realistic carrier network latency and message SID).

### 3. 📅 Google Calendar Event
- **Inputs**: Event title, description, start time, end time, reminder offset (e.g., 15 mins before).
- **Dispatcher**: Generates standard RFC 5545 downloadable `.ics` calendar files, creates 1-click Google Calendar web creation links, and mocks Google Calendar API event registration.

### 4. 🔔 Audible Alarm & Screen Alert
- **Inputs**: Alarm title, note/action item, alarm trigger time, ring tone option (*Chime*, *Beep*, *Gentle*).
- **Behavior**: When triggered (either automatically by the background scheduler or via "Trigger Now"), the frontend plays an audible alarm synthesized in real-time via the **Web Audio API** and presents a high-priority full-screen alert overlay with **"Stop Alarm"** and **"Snooze 10 Mins"** buttons.

---

## 💡 Innovative & Friendly Features

- **🌙 Quiet Hours Warning**: If a task or message is scheduled between **10:00 PM and 7:00 AM**, a gentle warning badge appears automatically: *"Scheduled during quiet hours"*, alerting the user to non-urgent late-night dispatches.
- **⚡ Quick Fill Templates**: One-click fill buttons that automatically populate message content and switch to the recommended channel:
  - `Quick Follow Up` (WhatsApp)
  - `Project Check-in` (SMS)
  - `Birthday Wish` (WhatsApp)
  - `Drink Water Reminder` (Audible Alarm)
- **⏳ Live Countdown Clock**: Each pending task card displays a real-time badge ticking down every second (*"Runs in 18 minutes"*, *"Runs in 2 days"*, *"Due now"*).
- **💤 One-Click Snooze**: Instant snooze dropdown options (`+10m`, `+1h`, `Tomorrow 9 AM`).
- **🗂️ Filter Tabs**: One-click channel switching between *"All Tasks"*, *"Messages (WhatsApp/SMS)"*, *"Calendar Events"*, and *"Alarms"*, plus status and instant text search.
- **🗣️ Plain-English Labels**: Strictly avoids dry developer jargon. Uses clear, intuitive labels: *"Send To"*, *"When to Trigger"*, *"Message"*, *"Repeat"*, *"Status"*.
- **🌓 Light / Dark Mode**: Seamless theme toggle with persistent `localStorage` preference and soft shadows.

---

## 🏗️ Project Architecture

```
Task Scheduler/
├── backend/                               # Spring Boot 3 Java 21 Application
│   ├── src/main/java/com/timeflow/
│   │   ├── config/
│   │   │   └── CorsConfig.java           # Cross-Origin Resource Sharing configuration
│   │   ├── controller/
│   │   │   └── TaskController.java       # REST endpoints for CRUD, snooze, run, .ics
│   │   ├── dispatcher/
│   │   │   ├── TaskDispatcher.java       # Dispatcher interface
│   │   │   ├── WhatsAppDispatcher.java   # Twilio WhatsApp mock service
│   │   │   ├── SmsDispatcher.java        # Twilio SMS mock service
│   │   │   ├── CalendarDispatcher.java   # RFC 5545 .ics generator & GCal integration
│   │   │   └── AlarmDispatcher.java      # Audible alarm dispatcher
│   │   ├── dto/
│   │   │   ├── TaskRequestDto.java       # Validation & request payload
│   │   │   ├── TaskResponseDto.java      # Formatted response with countdowns
│   │   │   ├── SnoozeRequestDto.java     # Preset snooze payload
│   │   │   ├── TaskStatsDto.java         # Summary cards statistics
│   │   │   └── TemplateDto.java          # Quick fill template data
│   │   ├── entity/
│   │   │   ├── Task.java                 # JPA Entity for task details
│   │   │   ├── TaskType.java             # Enum: WHATSAPP, SMS, CALENDAR, ALARM
│   │   │   ├── TaskStatus.java           # Enum: PENDING, RUNNING, SENT, TRIGGERED, SNOOZED, DISMISSED, FAILED
│   │   │   └── RingTone.java             # Enum: CHIME, BEEP, GENTLE
│   │   ├── repository/
│   │   │   └── TaskRepository.java       # JPA Repository with custom due task queries
│   │   ├── scheduler/
│   │   │   └── TaskSchedulerService.java # 20-second background heartbeat worker
│   │   ├── service/
│   │   │   └── TaskService.java          # Business logic, sample seeder & snooze math
│   │   └── TimeFlowApplication.java      # Main entry point with @EnableScheduling
│   ├── src/main/resources/
│   │   ├── application.properties        # H2 DB & server configuration (port 8085)
│   │   └── schema-postgres.sql           # Clean, production PostgreSQL DDL schema
│   ├── mvnw.cmd / mvnw                   # Maven Wrapper (no local Maven install needed)
│   └── pom.xml                           # Spring Boot 3.4.2 & Java 21 dependencies
│
└── frontend/                              # React 19 + Vite 8 + Tailwind CSS App
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx                # Ticking live clock, dark toggle, new task button
    │   │   ├── StatsCards.jsx            # Summary cards: Total Today, Alarms, Delivered
    │   │   ├── FilterBar.jsx             # Channel tabs, search bar, status selector
    │   │   ├── TaskCard.jsx              # Card with plain labels, countdown, snooze, trigger
    │   │   ├── CreateTaskModal.jsx       # Channel tabs, templates, quiet hours preview
    │   │   └── AlarmAlertBanner.jsx      # Full-screen audible alarm modal with Stop & Snooze
    │   ├── services/
    │   │   ├── api.js                    # Fetch client for all backend REST endpoints
    │   │   └── soundService.js           # Web Audio API synthesizers (Chime, Beep, Gentle)
    │   ├── App.jsx                       # Main orchestrator with polling & countdown ticker
    │   ├── index.css                     # Tailwind CSS, color tokens, and pulse animations
    │   └── main.jsx
    ├── index.html                        # Plus Jakarta Sans fonts and SVG icon
    ├── vite.config.js                    # Vite configuration with proxy to backend
    └── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java 21+**: Verify with `java -version`
- **Node.js 18+** & **npm**: Verify with `node -v` and `npm -v`

### 1. Run the Spring Boot Backend
The backend utilizes the Maven Wrapper (`mvnw` / `mvnw.cmd`) so no separate Maven installation is required.

```bash
# Navigate to the backend folder
cd backend

# On Windows:
./mvnw.cmd spring-boot:run

# On Linux/macOS:
./mvnw spring-boot:run
```

- **Backend Port**: `http://localhost:8085`
- **H2 Console**: `http://localhost:8085/h2-console`
  - **JDBC URL**: `jdbc:h2:mem:timeflowdb`
  - **Username**: `sa`
  - **Password**: *(leave blank)*

> 💡 *On startup, TimeFlow automatically seeds 5 realistic sample tasks (WhatsApp, SMS, Google Calendar, and Audible Alarms) if the database is fresh.*

### 2. Run the React Frontend
Open a separate terminal window:

```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies (only required on first setup)
npm install

# Start the Vite development server
npm run dev
```

- **Frontend App**: `http://localhost:5173`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List all tasks. Query params: `channel` (*ALL, MESSAGES, CALENDAR, ALARMS*), `status` (*ALL, PENDING, SENT, TRIGGERED, SNOOZED, DISMISSED*) |
| `GET` | `/api/tasks/{id}` | Retrieve single task by ID |
| `POST` | `/api/tasks` | Schedule a new task |
| `PUT` | `/api/tasks/{id}` | Update an existing scheduled task |
| `DELETE` | `/api/tasks/{id}` | Remove a task from schedule |
| `POST` | `/api/tasks/{id}/trigger` | **Trigger Now**: Immediately dispatch any task |
| `POST` | `/api/tasks/{id}/snooze` | Snooze task (`minutes`: 10/60, or `preset`: *PLUS_10M*, *PLUS_1H*, *TOMORROW_9AM*) |
| `POST` | `/api/tasks/{id}/stop-alarm`| Stop and dismiss an active ringing alarm |
| `GET` | `/api/tasks/active-alarms` | Get currently triggered audible alarms |
| `GET` | `/api/tasks/stats` | Dashboard counters (*totalToday*, *activeAlarms*, *deliveredMessages*, *pendingTasks*, *totalTasks*) |
| `GET` | `/api/tasks/templates` | Retrieve quick-fill message templates |
| `GET` | `/api/tasks/{id}/calendar.ics`| Download standard RFC 5545 iCalendar file |

---

## 🐘 PostgreSQL Production Schema

A clean PostgreSQL script is provided at `backend/src/main/resources/schema-postgres.sql`.

To switch from H2 to PostgreSQL in production:
1. Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/timeflow
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
```
2. Run `schema-postgres.sql` against your PostgreSQL database.

---

## 🧪 Background Scheduler Verification

The Spring Boot backend runs a fixed-rate heartbeat worker every 20 seconds:
```java
@Scheduled(fixedRate = 20000)
public void processDueTasks() {
    List<Task> dueTasks = taskRepository.findDueTasks(
        List.of(TaskStatus.PENDING, TaskStatus.SNOOZED), 
        LocalDateTime.now()
    );
    // Dispatches through WhatsAppDispatcher, SmsDispatcher, CalendarDispatcher, or AlarmDispatcher
}
```
When an alarm triggers, the frontend polls `/api/tasks/active-alarms` every 3 seconds, initiates looping sound synthesis via the Web Audio API, and displays the full-screen alert banner until stopped or snoozed.
