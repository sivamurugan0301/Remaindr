package com.timeflow.dto;

public class TaskStatsDto {

    private long totalToday;
    private long activeAlarms;
    private long deliveredMessages;
    private long pendingTasks;
    private long totalTasks;

    public TaskStatsDto() {
    }

    public TaskStatsDto(long totalToday, long activeAlarms, long deliveredMessages, long pendingTasks, long totalTasks) {
        this.totalToday = totalToday;
        this.activeAlarms = activeAlarms;
        this.deliveredMessages = deliveredMessages;
        this.pendingTasks = pendingTasks;
        this.totalTasks = totalTasks;
    }

    public long getTotalToday() {
        return totalToday;
    }

    public void setTotalToday(long totalToday) {
        this.totalToday = totalToday;
    }

    public long getActiveAlarms() {
        return activeAlarms;
    }

    public void setActiveAlarms(long activeAlarms) {
        this.activeAlarms = activeAlarms;
    }

    public long getDeliveredMessages() {
        return deliveredMessages;
    }

    public void setDeliveredMessages(long deliveredMessages) {
        this.deliveredMessages = deliveredMessages;
    }

    public long getPendingTasks() {
        return pendingTasks;
    }

    public void setPendingTasks(long pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(long totalTasks) {
        this.totalTasks = totalTasks;
    }
}
