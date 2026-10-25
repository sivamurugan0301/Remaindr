package com.timeflow.dto;

import com.timeflow.entity.RingTone;
import com.timeflow.entity.Task;
import com.timeflow.entity.TaskStatus;
import com.timeflow.entity.TaskType;

import java.time.Duration;
import java.time.LocalDateTime;

public class TaskResponseDto {

    private Long id;
    private String title;
    private TaskType taskType;
    private TaskStatus taskStatus;
    private LocalDateTime scheduledTime;
    private String recipient;
    private String messageBody;
    private String eventDescription;
    private LocalDateTime eventStartTime;
    private LocalDateTime eventEndTime;
    private Integer reminderOffsetMinutes;
    private String icsContent;
    private String googleCalendarLink;
    private RingTone ringTone;
    private Boolean isQuietHours;
    private LocalDateTime dispatchedAt;
    private String dispatchResult;
    private String repeatFrequency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed countdown helpers
    private Long secondsUntilDue;
    private String countdownFormatted;

    public TaskResponseDto() {
    }

    public static TaskResponseDto fromEntity(Task task) {
        if (task == null) return null;

        TaskResponseDto dto = new TaskResponseDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setTaskType(task.getTaskType());
        dto.setTaskStatus(task.getTaskStatus());
        dto.setScheduledTime(task.getScheduledTime());
        dto.setRecipient(task.getRecipient());
        dto.setMessageBody(task.getMessageBody());
        dto.setEventDescription(task.getEventDescription());
        dto.setEventStartTime(task.getEventStartTime());
        dto.setEventEndTime(task.getEventEndTime());
        dto.setReminderOffsetMinutes(task.getReminderOffsetMinutes());
        dto.setIcsContent(task.getIcsContent());
        dto.setGoogleCalendarLink(task.getGoogleCalendarLink());
        dto.setRingTone(task.getRingTone());
        dto.setIsQuietHours(task.getIsQuietHours());
        dto.setDispatchedAt(task.getDispatchedAt());
        dto.setDispatchResult(task.getDispatchResult());
        dto.setRepeatFrequency(task.getRepeatFrequency());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());

        // Calculate countdown
        if (task.getScheduledTime() != null) {
            LocalDateTime now = LocalDateTime.now();
            Duration duration = Duration.between(now, task.getScheduledTime());
            long seconds = duration.getSeconds();
            dto.setSecondsUntilDue(seconds);

            if (seconds <= 0) {
                dto.setCountdownFormatted("Due now");
            } else if (seconds < 60) {
                dto.setCountdownFormatted("Runs in " + seconds + "s");
            } else if (seconds < 3600) {
                long mins = seconds / 60;
                dto.setCountdownFormatted("Runs in " + mins + " " + (mins == 1 ? "minute" : "minutes"));
            } else if (seconds < 86400) {
                long hours = seconds / 3600;
                long mins = (seconds % 3600) / 60;
                dto.setCountdownFormatted(String.format("Runs in %dh %dm", hours, mins));
            } else {
                long days = seconds / 86400;
                dto.setCountdownFormatted("Runs in " + days + " " + (days == 1 ? "day" : "days"));
            }
        }

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public TaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(TaskType taskType) {
        this.taskType = taskType;
    }

    public TaskStatus getTaskStatus() {
        return taskStatus;
    }

    public void setTaskStatus(TaskStatus taskStatus) {
        this.taskStatus = taskStatus;
    }

    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public String getRecipient() {
        return recipient;
    }

    public void setRecipient(String recipient) {
        this.recipient = recipient;
    }

    public String getMessageBody() {
        return messageBody;
    }

    public void setMessageBody(String messageBody) {
        this.messageBody = messageBody;
    }

    public String getEventDescription() {
        return eventDescription;
    }

    public void setEventDescription(String eventDescription) {
        this.eventDescription = eventDescription;
    }

    public LocalDateTime getEventStartTime() {
        return eventStartTime;
    }

    public void setEventStartTime(LocalDateTime eventStartTime) {
        this.eventStartTime = eventStartTime;
    }

    public LocalDateTime getEventEndTime() {
        return eventEndTime;
    }

    public void setEventEndTime(LocalDateTime eventEndTime) {
        this.eventEndTime = eventEndTime;
    }

    public Integer getReminderOffsetMinutes() {
        return reminderOffsetMinutes;
    }

    public void setReminderOffsetMinutes(Integer reminderOffsetMinutes) {
        this.reminderOffsetMinutes = reminderOffsetMinutes;
    }

    public String getIcsContent() {
        return icsContent;
    }

    public void setIcsContent(String icsContent) {
        this.icsContent = icsContent;
    }

    public String getGoogleCalendarLink() {
        return googleCalendarLink;
    }

    public void setGoogleCalendarLink(String googleCalendarLink) {
        this.googleCalendarLink = googleCalendarLink;
    }

    public RingTone getRingTone() {
        return ringTone;
    }

    public void setRingTone(RingTone ringTone) {
        this.ringTone = ringTone;
    }

    public Boolean getIsQuietHours() {
        return isQuietHours;
    }

    public void setIsQuietHours(Boolean isQuietHours) {
        this.isQuietHours = isQuietHours;
    }

    public LocalDateTime getDispatchedAt() {
        return dispatchedAt;
    }

    public void setDispatchedAt(LocalDateTime dispatchedAt) {
        this.dispatchedAt = dispatchedAt;
    }

    public String getDispatchResult() {
        return dispatchResult;
    }

    public void setDispatchResult(String dispatchResult) {
        this.dispatchResult = dispatchResult;
    }

    public String getRepeatFrequency() {
        return repeatFrequency;
    }

    public void setRepeatFrequency(String repeatFrequency) {
        this.repeatFrequency = repeatFrequency;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Long getSecondsUntilDue() {
        return secondsUntilDue;
    }

    public void setSecondsUntilDue(Long secondsUntilDue) {
        this.secondsUntilDue = secondsUntilDue;
    }

    public String getCountdownFormatted() {
        return countdownFormatted;
    }

    public void setCountdownFormatted(String countdownFormatted) {
        this.countdownFormatted = countdownFormatted;
    }
}
