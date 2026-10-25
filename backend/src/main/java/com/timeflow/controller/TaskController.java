package com.timeflow.controller;

import com.timeflow.dto.SnoozeRequestDto;
import com.timeflow.dto.TaskRequestDto;
import com.timeflow.dto.TaskResponseDto;
import com.timeflow.dto.TaskStatsDto;
import com.timeflow.dto.TemplateDto;
import com.timeflow.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public ResponseEntity<List<TaskResponseDto>> getTasks(
            @RequestParam(name = "channel", required = false, defaultValue = "ALL") String channel,
            @RequestParam(name = "status", required = false, defaultValue = "ALL") String status) {
        List<TaskResponseDto> tasks = taskService.getTasks(channel, status);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDto> getTaskById(@PathVariable("id") Long id) {
        TaskResponseDto task = taskService.getTaskById(id);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@Valid @RequestBody TaskRequestDto dto) {
        TaskResponseDto created = taskService.createTask(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDto> updateTask(
            @PathVariable("id") Long id,
            @Valid @RequestBody TaskRequestDto dto) {
        TaskResponseDto updated = taskService.updateTask(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable("id") Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(Map.of("message", "Task successfully removed", "id", id.toString()));
    }

    @PostMapping("/{id}/trigger")
    public ResponseEntity<TaskResponseDto> triggerNow(@PathVariable("id") Long id) {
        TaskResponseDto executed = taskService.triggerTaskNow(id);
        return ResponseEntity.ok(executed);
    }

    @PostMapping("/{id}/snooze")
    public ResponseEntity<TaskResponseDto> snoozeTask(
            @PathVariable("id") Long id,
            @RequestBody(required = false) SnoozeRequestDto snoozeDto) {
        if (snoozeDto == null) {
            snoozeDto = new SnoozeRequestDto(10, "PLUS_10M");
        }
        TaskResponseDto snoozed = taskService.snoozeTask(id, snoozeDto);
        return ResponseEntity.ok(snoozed);
    }

    @PostMapping("/{id}/stop-alarm")
    public ResponseEntity<TaskResponseDto> stopAlarm(@PathVariable("id") Long id) {
        TaskResponseDto stopped = taskService.stopAlarm(id);
        return ResponseEntity.ok(stopped);
    }

    @GetMapping("/active-alarms")
    public ResponseEntity<List<TaskResponseDto>> getActiveAlarms() {
        return ResponseEntity.ok(taskService.getActiveAlarms());
    }

    @GetMapping("/stats")
    public ResponseEntity<TaskStatsDto> getStats() {
        return ResponseEntity.ok(taskService.getStats());
    }

    @GetMapping("/templates")
    public ResponseEntity<List<TemplateDto>> getTemplates() {
        return ResponseEntity.ok(taskService.getQuickTemplates());
    }

    @GetMapping("/{id}/calendar.ics")
    public ResponseEntity<byte[]> downloadIcsFile(@PathVariable("id") Long id) {
        String icsContent = taskService.getIcsContent(id);
        byte[] bytes = icsContent.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/calendar; charset=utf-8"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"event-" + id + ".ics\"");
        headers.setContentLength(bytes.length);

        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
