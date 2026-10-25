package com.timeflow.dto;

public class SnoozeRequestDto {

    // Can specify minutes directly (e.g., 10, 60)
    private Integer minutes;

    // Or presets: "PLUS_10M", "PLUS_1H", "TOMORROW_9AM"
    private String preset;

    public SnoozeRequestDto() {
    }

    public SnoozeRequestDto(Integer minutes, String preset) {
        this.minutes = minutes;
        this.preset = preset;
    }

    public Integer getMinutes() {
        return minutes;
    }

    public void setMinutes(Integer minutes) {
        this.minutes = minutes;
    }

    public String getPreset() {
        return preset;
    }

    public void setPreset(String preset) {
        this.preset = preset;
    }
}
