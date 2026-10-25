package com.timeflow.dispatcher;

import com.timeflow.entity.Task;
import com.timeflow.entity.TaskStatus;
import com.timeflow.entity.TaskType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class CalendarDispatcher implements TaskDispatcher {

    private static final Logger log = LoggerFactory.getLogger(CalendarDispatcher.class);
    private static final DateTimeFormatter ICS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");

    @Override
    public boolean supports(TaskType type) {
        return TaskType.CALENDAR.equals(type);
    }

    @Override
    public void dispatch(Task task) {
        log.info("================================================================================");
        log.info("[GOOGLE CALENDAR DISPATCHER] Scheduling Calendar Event");
        log.info("Task ID     : {}", task.getId());
        log.info("Event Title : {}", task.getTitle());
        log.info("Description : {}", task.getEventDescription());
        log.info("Start Time  : {}", task.getEventStartTime());
        log.info("End Time    : {}", task.getEventEndTime());
        log.info("Reminder    : {} minutes before", task.getReminderOffsetMinutes());

        LocalDateTime start = task.getEventStartTime() != null ? task.getEventStartTime() : task.getScheduledTime();
        LocalDateTime end = task.getEventEndTime() != null ? task.getEventEndTime() : start.plusHours(1);
        int reminderOffset = task.getReminderOffsetMinutes() != null ? task.getReminderOffsetMinutes() : 15;

        // 1. Generate standard RFC 5545 .ics content
        String uid = "timeflow-" + (task.getId() != null ? task.getId() : UUID.randomUUID()) + "@timeflow.local";
        String nowStr = LocalDateTime.now().format(ICS_DATE_FORMAT);
        String startStr = start.format(ICS_DATE_FORMAT);
        String endStr = end.format(ICS_DATE_FORMAT);

        StringBuilder ics = new StringBuilder();
        ics.append("BEGIN:VCALENDAR\r\n");
        ics.append("VERSION:2.0\r\n");
        ics.append("PRODID:-//TimeFlow//Task & Alert Scheduler//EN\r\n");
        ics.append("CALSCALE:GREGORIAN\r\n");
        ics.append("METHOD:PUBLISH\r\n");
        ics.append("BEGIN:VEVENT\r\n");
        ics.append("UID:").append(uid).append("\r\n");
        ics.append("DTSTAMP:").append(nowStr).append("\r\n");
        ics.append("DTSTART:").append(startStr).append("\r\n");
        ics.append("DTEND:").append(endStr).append("\r\n");
        ics.append("SUMMARY:").append(escapeIcs(task.getTitle())).append("\r\n");
        if (task.getEventDescription() != null && !task.getEventDescription().isBlank()) {
            ics.append("DESCRIPTION:").append(escapeIcs(task.getEventDescription())).append("\r\n");
        }
        ics.append("BEGIN:VALARM\r\n");
        ics.append("TRIGGER:-PT").append(reminderOffset).append("M\r\n");
        ics.append("ACTION:DISPLAY\r\n");
        ics.append("DESCRIPTION:Reminder: ").append(escapeIcs(task.getTitle())).append("\r\n");
        ics.append("END:VALARM\r\n");
        ics.append("END:VEVENT\r\n");
        ics.append("END:VCALENDAR\r\n");

        task.setIcsContent(ics.toString());

        // 2. Generate Google Calendar web link for instant 1-click addition
        try {
            String encodedTitle = URLEncoder.encode(task.getTitle() != null ? task.getTitle() : "Scheduled Event", StandardCharsets.UTF_8);
            String encodedDesc = URLEncoder.encode(task.getEventDescription() != null ? task.getEventDescription() : "", StandardCharsets.UTF_8);
            String gcalLink = String.format("https://calendar.google.com/calendar/render?action=TEMPLATE&text=%s&details=%s&dates=%s/%s",
                    encodedTitle, encodedDesc, startStr, endStr);
            task.setGoogleCalendarLink(gcalLink);
        } catch (Exception e) {
            log.warn("Could not encode Google Calendar link: {}", e.getMessage());
        }

        // 3. Mock Google Calendar API synchronization
        String mockEventId = "gcal_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        task.setTaskStatus(TaskStatus.SENT);
        task.setDispatchedAt(LocalDateTime.now());
        task.setDispatchResult("Event added to calendar");

        log.info("[GOOGLE CALENDAR DISPATCHER] Event registered with Google Calendar API (Mock ID: {}) and .ics file generated", mockEventId);
        log.info("================================================================================");
    }

    private String escapeIcs(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace(";", "\\;")
                   .replace(",", "\\,")
                   .replace("\n", "\\n")
                   .replace("\r", "");
    }
}
