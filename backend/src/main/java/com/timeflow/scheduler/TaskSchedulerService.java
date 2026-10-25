package com.timeflow.scheduler;

import com.timeflow.entity.Task;
import com.timeflow.entity.TaskStatus;
import com.timeflow.repository.TaskRepository;
import com.timeflow.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(TaskSchedulerService.class);

    private final TaskRepository taskRepository;
    private final TaskService taskService;

    public TaskSchedulerService(TaskRepository taskRepository, TaskService taskService) {
        this.taskRepository = taskRepository;
        this.taskService = taskService;
    }

    /**
     * Background scheduler job checking for due tasks every 20 seconds
     */
    @Scheduled(fixedRate = 20000)
    @Transactional
    public void processDueTasks() {
        LocalDateTime now = LocalDateTime.now();
        List<TaskStatus> eligibleStatuses = List.of(TaskStatus.PENDING, TaskStatus.SNOOZED);
        List<Task> dueTasks = taskRepository.findDueTasks(eligibleStatuses, now);

        if (!dueTasks.isEmpty()) {
            log.info("[BACKGROUND SCHEDULER] Found {} due task(s) ready for dispatch at {}", dueTasks.size(), now);

            for (Task task : dueTasks) {
                try {
                    log.info("[BACKGROUND SCHEDULER] Executing task ID {} - '{}' ({})", 
                            task.getId(), task.getTitle(), task.getTaskType());
                    
                    task.setTaskStatus(TaskStatus.RUNNING);
                    taskRepository.saveAndFlush(task);

                    taskService.executeTask(task);
                    taskRepository.save(task);

                    log.info("[BACKGROUND SCHEDULER] Task ID {} processed with status: {}", 
                            task.getId(), task.getTaskStatus());
                } catch (Exception e) {
                    log.error("[BACKGROUND SCHEDULER] Failed to execute task ID {}: {}", task.getId(), e.getMessage(), e);
                    task.setTaskStatus(TaskStatus.FAILED);
                    task.setDispatchResult("Execution error: " + e.getMessage());
                    taskRepository.save(task);
                }
            }
        }
    }
}
