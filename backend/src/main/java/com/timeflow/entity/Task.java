package com.timeflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false)
    private TaskType taskType;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_status", nullable = false)
    private TaskStatus taskStatus = TaskStatus.PENDING;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    // WhatsApp channel fields
    private String recipient;

    @Lob
    @Column(name = "message_body", length = 4000)
    private String messageBody;

    // Calendar channel fields
    @Lob
    @Column(name = "event_description", length = 4000)
    private String eventDescription;

    @Column(name = "event_start_time")
    private LocalDateTime eventStartTime;

    @Column(name = "event_end_time")
    private LocalDateTime eventEndTime;

    @Column(name = "reminder_offset_minutes")
    private Integer reminderOffsetMinutes = 15;

    @Lob
    @Column(name = "ics_content", length = 10000)
    private String icsContent;

    @Column(name = "google_calendar_link", length = 500)
    private String googleCalendarLink;

    // Alarm channel fields
    @Enumerated(EnumType.STRING)
    @Column(name = "ring_tone")
    private RingTone ringTone = RingTone.CHIME;

    // Quiet Hours Indicator
    @Column(name = "is_quiet_hours")
    private Boolean isQuietHours = false;

    // Dispatcher tracking
    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Lob
    @Column(name = "dispatch_result", length = 2000)
    private String dispatchResult;

    @Column(name = "repeat_frequency")
    private String repeatFrequency = "ONCE"; // ONCE, DAILY, WEEKLY

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Task() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        updateQuietHoursStatus();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        updateQuietHoursStatus();
    }

    public void updateQuietHoursStatus() {
        LocalDateTime timeToCheck = this.scheduledTime != null ? this.scheduledTime : this.eventStartTime;
        if (timeToCheck != null) {
            int hour = timeToCheck.getHour();
            this.isQuietHours = (hour >= 22 || hour < 7);
        } else {
            this.isQuietHours = false;
        }
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
        updateQuietHoursStatus();
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
        updateQuietHoursStatus();
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
}
