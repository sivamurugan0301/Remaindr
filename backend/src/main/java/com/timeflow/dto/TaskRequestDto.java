package com.timeflow.dto;

import com.timeflow.entity.RingTone;
import com.timeflow.entity.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class TaskRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Task type is required")
    private TaskType taskType;

    private LocalDateTime scheduledTime;

    // WhatsApp
    private String recipient;
    private String messageBody;

    // Calendar
    private String eventDescription;
    private LocalDateTime eventStartTime;
    private LocalDateTime eventEndTime;
    private Integer reminderOffsetMinutes = 15;

    // Alarm
    private RingTone ringTone = RingTone.CHIME;

    // Recurrence
    private String repeatFrequency = "ONCE";

    public TaskRequestDto() {
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

    public RingTone getRingTone() {
        return ringTone;
    }

    public void setRingTone(RingTone ringTone) {
        this.ringTone = ringTone;
    }

    public String getRepeatFrequency() {
        return repeatFrequency;
    }

    public void setRepeatFrequency(String repeatFrequency) {
        this.repeatFrequency = repeatFrequency;
    }
}
