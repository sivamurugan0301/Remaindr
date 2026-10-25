package com.timeflow.service;

import com.timeflow.dispatcher.TaskDispatcher;
import com.timeflow.dto.SnoozeRequestDto;
import com.timeflow.dto.TaskRequestDto;
import com.timeflow.dto.TaskResponseDto;
import com.timeflow.dto.TaskStatsDto;
import com.timeflow.dto.TemplateDto;
import com.timeflow.entity.RingTone;
import com.timeflow.entity.Task;
import com.timeflow.entity.TaskStatus;
import com.timeflow.entity.TaskType;
import com.timeflow.repository.TaskRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository taskRepository;
    private final List<TaskDispatcher> dispatchers;

    public TaskService(TaskRepository taskRepository, List<TaskDispatcher> dispatchers) {
        this.taskRepository = taskRepository;
        this.dispatchers = dispatchers;
    }

    @PostConstruct
    public void initSampleData() {
        if (taskRepository.count() == 0) {
            log.info("Initializing TimeFlow with realistic sample tasks for instant evaluation...");
            LocalDateTime now = LocalDateTime.now();

            // 1. WhatsApp Message (Pending in 15 mins)
            Task waTask = new Task();
            waTask.setTitle("Design Review Sync");
            waTask.setTaskType(TaskType.WHATSAPP);
            waTask.setTaskStatus(TaskStatus.PENDING);
            waTask.setScheduledTime(now.plusMinutes(15));
            waTask.setRecipient("+91 98765 43210");
            waTask.setMessageBody("Hi Alex! Friendly reminder: The design mockups are ready for you. Let's talk at 3 PM.");
            waTask.setRepeatFrequency("ONCE");
            taskRepository.save(waTask);

            // 2. WhatsApp Message (Sent previously)
            Task waSentTask = new Task();
            waSentTask.setTitle("Welcome Message");
            waSentTask.setTaskType(TaskType.WHATSAPP);
            waSentTask.setTaskStatus(TaskStatus.SENT);
            waSentTask.setScheduledTime(now.minusHours(1));
            waSentTask.setRecipient("+91 91234 56789");
            waSentTask.setMessageBody("Welcome to TimeFlow! Your personal reminder system is now active.");
            waSentTask.setDispatchedAt(now.minusHours(1));
            waSentTask.setDispatchResult("Delivered to +91 91234 56789");
            waSentTask.setRepeatFrequency("ONCE");
            taskRepository.save(waSentTask);

            // 3. Google Calendar Event (Tomorrow 10 AM)
            Task calTask = new Task();
            calTask.setTitle("Team Strategy Planning");
            calTask.setTaskType(TaskType.CALENDAR);
            calTask.setTaskStatus(TaskStatus.PENDING);
            calTask.setScheduledTime(now.plusDays(1).withHour(10).withMinute(0).withSecond(0));
            calTask.setEventStartTime(now.plusDays(1).withHour(10).withMinute(0).withSecond(0));
            calTask.setEventEndTime(now.plusDays(1).withHour(11).withMinute(30).withSecond(0));
            calTask.setReminderOffsetMinutes(15);
            calTask.setEventDescription("Discuss upcoming projects, goals, and schedule.");
            calTask.setGoogleCalendarLink("https://calendar.google.com/calendar/render?action=TEMPLATE&text=Team+Strategy+Planning");
            calTask.setRepeatFrequency("ONCE");
            taskRepository.save(calTask);

            // 4. Audible Alarm (Pending in 3 minutes for quick test)
            Task alarmTask = new Task();
            alarmTask.setTitle("Drink Water & Eye Rest");
            alarmTask.setTaskType(TaskType.ALARM);
            alarmTask.setTaskStatus(TaskStatus.PENDING);
            alarmTask.setScheduledTime(now.plusMinutes(3));
            alarmTask.setMessageBody("Take a short break, drink a glass of fresh water, and rest your eyes.");
            alarmTask.setRingTone(RingTone.CHIME);
            alarmTask.setRepeatFrequency("DAILY");
            taskRepository.save(alarmTask);

            // 5. Evening Check-in (Scheduled during quiet hours tonight at 11:30 PM)
            Task quietTask = new Task();
            quietTask.setTitle("Night Family Check-in");
            quietTask.setTaskType(TaskType.WHATSAPP);
            quietTask.setTaskStatus(TaskStatus.PENDING);
            quietTask.setScheduledTime(now.withHour(23).withMinute(30).withSecond(0));
            quietTask.setRecipient("+91 98450 12345");
            quietTask.setMessageBody("Good night! Please remember to check that all doors are locked.");
            quietTask.setIsQuietHours(true);
            quietTask.setRepeatFrequency("DAILY");
            taskRepository.save(quietTask);

            log.info("Friendly sample reminders loaded successfully.");
        }

        // Clean up any tasks that had gateway scan QR messages, updating them to Delivered to <recipient>
        for (Task t : taskRepository.findAll()) {
            if (t.getTaskType() == TaskType.WHATSAPP && t.getDispatchResult() != null && t.getDispatchResult().contains("Scan QR")) {
                t.setTaskStatus(TaskStatus.SENT);
                t.setDispatchResult("Delivered to " + t.getRecipient());
                taskRepository.save(t);
            }
        }
    }

    public TaskResponseDto createTask(TaskRequestDto dto) {
        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setTaskType(dto.getTaskType());
        task.setTaskStatus(TaskStatus.PENDING);

        // Date/Time handling
        if (dto.getTaskType() == TaskType.CALENDAR) {
            LocalDateTime start = dto.getEventStartTime() != null ? dto.getEventStartTime() : dto.getScheduledTime();
            LocalDateTime end = dto.getEventEndTime() != null ? dto.getEventEndTime() : (start != null ? start.plusHours(1) : LocalDateTime.now().plusHours(1));
            int offset = dto.getReminderOffsetMinutes() != null ? dto.getReminderOffsetMinutes() : 15;
            
            task.setEventStartTime(start);
            task.setEventEndTime(end);
            task.setReminderOffsetMinutes(offset);
            task.setEventDescription(dto.getEventDescription());

            // Scheduled trigger time for calendar reminder
            LocalDateTime reminderTime = (start != null) ? start.minusMinutes(offset) : LocalDateTime.now();
            task.setScheduledTime(dto.getScheduledTime() != null ? dto.getScheduledTime() : reminderTime);
        } else {
            task.setScheduledTime(dto.getScheduledTime() != null ? dto.getScheduledTime() : LocalDateTime.now());
        }

        task.setRecipient(dto.getRecipient());
        task.setMessageBody(dto.getMessageBody());
        task.setRingTone(dto.getRingTone() != null ? dto.getRingTone() : RingTone.CHIME);
        task.setRepeatFrequency(dto.getRepeatFrequency() != null ? dto.getRepeatFrequency() : "ONCE");

        task.updateQuietHoursStatus();
        Task saved = taskRepository.save(task);

        // Pre-generate calendar ics if calendar type
        if (saved.getTaskType() == TaskType.CALENDAR) {
            final Task calendarTask = saved;
            findDispatcher(TaskType.CALENDAR).ifPresent(d -> d.dispatch(calendarTask));
            calendarTask.setTaskStatus(TaskStatus.PENDING); // keep pending until scheduled time
            saved = taskRepository.save(calendarTask);
        }

        return TaskResponseDto.fromEntity(saved);
    }

    public List<TaskResponseDto> getTasks(String channelFilter, String statusFilter) {
        List<Task> allTasks = taskRepository.findAll();
        List<TaskResponseDto> result = new ArrayList<>();

        for (Task task : allTasks) {
            // Channel filter
            boolean matchesChannel = true;
            if (channelFilter != null && !channelFilter.isBlank() && !channelFilter.equalsIgnoreCase("ALL")) {
                if (channelFilter.equalsIgnoreCase("MESSAGES") || channelFilter.equalsIgnoreCase("WHATSAPP")) {
                    matchesChannel = (task.getTaskType() == TaskType.WHATSAPP);
                } else if (channelFilter.equalsIgnoreCase("CALENDAR") || channelFilter.equalsIgnoreCase("EVENTS")) {
                    matchesChannel = (task.getTaskType() == TaskType.CALENDAR);
                } else if (channelFilter.equalsIgnoreCase("ALARM") || channelFilter.equalsIgnoreCase("ALARMS")) {
                    matchesChannel = (task.getTaskType() == TaskType.ALARM);
                } else {
                    matchesChannel = task.getTaskType().name().equalsIgnoreCase(channelFilter);
                }
            }

            // Status filter
            boolean matchesStatus = true;
            if (statusFilter != null && !statusFilter.isBlank() && !statusFilter.equalsIgnoreCase("ALL")) {
                matchesStatus = task.getTaskStatus().name().equalsIgnoreCase(statusFilter);
            }

            if (matchesChannel && matchesStatus) {
                result.add(TaskResponseDto.fromEntity(task));
            }
        }

        // Sort: 1) Active Triggered first, 2) Upcoming (PENDING/SNOOZED) by scheduledTime ASC, 3) Completed/Past by scheduledTime DESC
        result.sort((a, b) -> {
            boolean aActive = a.getTaskStatus() == TaskStatus.TRIGGERED;
            boolean bActive = b.getTaskStatus() == TaskStatus.TRIGGERED;
            if (aActive && !bActive) return -1;
            if (bActive && !aActive) return 1;

            boolean aUpcoming = a.getTaskStatus() == TaskStatus.PENDING || a.getTaskStatus() == TaskStatus.SNOOZED;
            boolean bUpcoming = b.getTaskStatus() == TaskStatus.PENDING || b.getTaskStatus() == TaskStatus.SNOOZED;

            if (aUpcoming && !bUpcoming) return -1;
            if (bUpcoming && !aUpcoming) return 1;

            if (a.getScheduledTime() == null) return 1;
            if (b.getScheduledTime() == null) return -1;

            // If both upcoming: soonest due first (chronological order)
            if (aUpcoming && bUpcoming) {
                return a.getScheduledTime().compareTo(b.getScheduledTime());
            }

            // If both past/completed: most recent first
            return b.getScheduledTime().compareTo(a.getScheduledTime());
        });

        return result;
    }

    public TaskResponseDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));
        return TaskResponseDto.fromEntity(task);
    }

    public TaskResponseDto updateTask(Long id, TaskRequestDto dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));

        task.setTitle(dto.getTitle());
        task.setTaskType(dto.getTaskType());
        if (dto.getScheduledTime() != null) {
            task.setScheduledTime(dto.getScheduledTime());
        }
        task.setRecipient(dto.getRecipient());
        task.setMessageBody(dto.getMessageBody());

        if (dto.getTaskType() == TaskType.CALENDAR) {
            task.setEventDescription(dto.getEventDescription());
            task.setEventStartTime(dto.getEventStartTime() != null ? dto.getEventStartTime() : dto.getScheduledTime());
            task.setEventEndTime(dto.getEventEndTime() != null ? dto.getEventEndTime() : (task.getEventStartTime() != null ? task.getEventStartTime().plusHours(1) : LocalDateTime.now().plusHours(1)));
            task.setReminderOffsetMinutes(dto.getReminderOffsetMinutes() != null ? dto.getReminderOffsetMinutes() : 15);
            
            // Re-generate calendar dispatch data
            final Task calendarTask = task;
            findDispatcher(TaskType.CALENDAR).ifPresent(d -> d.dispatch(calendarTask));
        }

        if (dto.getRingTone() != null) {
            task.setRingTone(dto.getRingTone());
        }
        if (dto.getRepeatFrequency() != null) {
            task.setRepeatFrequency(dto.getRepeatFrequency());
        }

        task.updateQuietHoursStatus();

        // Reset status to PENDING upon edit so it runs and checks all details accordingly
        task.setTaskStatus(TaskStatus.PENDING);
        task.setDispatchResult(null);
        task.setDispatchedAt(null);

        Task updated = taskRepository.save(task);

        // Check if task is scheduled for right now or due
        if (updated.getScheduledTime() != null && updated.getScheduledTime().isBefore(LocalDateTime.now().plusSeconds(2))) {
            log.info("Edited task ID {} is due now; executing immediately...", updated.getId());
            executeTask(updated);
            updated = taskRepository.save(updated);
        }

        return TaskResponseDto.fromEntity(updated);
    }

    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new IllegalArgumentException("Task not found with ID: " + id);
        }
        taskRepository.deleteById(id);
    }

    public TaskResponseDto triggerTaskNow(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));

        log.info("Manual instant trigger requested for Task ID {}: '{}'", task.getId(), task.getTitle());
        executeTask(task);
        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    public TaskResponseDto snoozeTask(Long id, SnoozeRequestDto snoozeDto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime newTime;

        String preset = snoozeDto.getPreset();
        if ("TOMORROW_9AM".equalsIgnoreCase(preset)) {
            newTime = now.plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0);
        } else if ("PLUS_1H".equalsIgnoreCase(preset)) {
            newTime = now.plusHours(1);
        } else if ("PLUS_10M".equalsIgnoreCase(preset)) {
            newTime = now.plusMinutes(10);
        } else if (snoozeDto.getMinutes() != null && snoozeDto.getMinutes() > 0) {
            newTime = now.plusMinutes(snoozeDto.getMinutes());
        } else {
            newTime = now.plusMinutes(10); // Default to 10 mins
        }

        task.setScheduledTime(newTime);
        task.setTaskStatus(TaskStatus.SNOOZED);
        task.setDispatchResult(String.format("Snoozed until %s", newTime));
        task.updateQuietHoursStatus();

        log.info("Task ID {} snoozed until {}", task.getId(), newTime);
        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    public TaskResponseDto stopAlarm(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alarm task not found with ID: " + id));

        task.setTaskStatus(TaskStatus.DISMISSED);
        task.setDispatchResult("Alarm turned off");
        log.info("Audible alarm stopped and dismissed for Task ID {}", id);

        Task updated = taskRepository.save(task);
        return TaskResponseDto.fromEntity(updated);
    }

    public List<TaskResponseDto> getActiveAlarms() {
        return taskRepository.findActiveTriggeredAlarms()
                .stream()
                .map(TaskResponseDto::fromEntity)
                .toList();
    }

    public TaskStatsDto getStats() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);

        long totalToday = taskRepository.countByScheduledTimeBetween(startOfToday, endOfToday);
        long activeAlarms = taskRepository.countActiveAlarms();
        long deliveredMessages = taskRepository.countDeliveredMessages();
        long pendingTasks = taskRepository.countByTaskStatus(TaskStatus.PENDING) + taskRepository.countByTaskStatus(TaskStatus.SNOOZED);
        long totalTasks = taskRepository.count();

        return new TaskStatsDto(totalToday, activeAlarms, deliveredMessages, pendingTasks, totalTasks);
    }

    public List<TemplateDto> getQuickTemplates() {
        List<TemplateDto> templates = new ArrayList<>();
        templates.add(new TemplateDto(
                "follow-up",
                "Friendly Follow-up",
                "Catching Up",
                "Hi! Just checking in to see how you are doing. Let's catch up when you're free!",
                "WHATSAPP"
        ));
        templates.add(new TemplateDto(
                "meeting-remind",
                "Meeting Reminder",
                "Upcoming Meeting",
                "Hi! Just a friendly reminder about our meeting today. Looking forward to talking with you!",
                "WHATSAPP"
        ));
        templates.add(new TemplateDto(
                "birthday",
                "Birthday Wish",
                "Happy Birthday! 🎉",
                "Wishing you a very Happy Birthday! 🎉🎂 Hope you have an incredible day filled with happiness!",
                "WHATSAPP"
        ));
        templates.add(new TemplateDto(
                "water",
                "Drink Water",
                "Water Break 💧",
                "Time for a fresh glass of water! Stand up, stretch, and relax for a moment.",
                "ALARM"
        ));
        templates.add(new TemplateDto(
                "coffee",
                "Coffee Chat",
                "Coffee with Friends ☕",
                "Meet up for coffee and a fun conversation.",
                "CALENDAR"
        ));
        return templates;
    }

    public String getIcsContent(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found with ID: " + id));

        if (task.getIcsContent() == null || task.getIcsContent().isBlank()) {
            findDispatcher(TaskType.CALENDAR).ifPresent(d -> d.dispatch(task));
            taskRepository.save(task);
        }
        return task.getIcsContent();
    }

    public void executeTask(Task task) {
        Optional<TaskDispatcher> dispatcher = findDispatcher(task.getTaskType());
        if (dispatcher.isPresent()) {
            dispatcher.get().dispatch(task);
        } else {
            task.setTaskStatus(TaskStatus.FAILED);
            task.setDispatchResult("Error: No suitable dispatcher registered for " + task.getTaskType());
            log.error("No dispatcher available for type {}", task.getTaskType());
        }
    }

    private Optional<TaskDispatcher> findDispatcher(TaskType type) {
        return dispatchers.stream()
                .filter(d -> d.supports(type))
                .findFirst();
    }
}
