package com.timeflow.repository;

import com.timeflow.entity.Task;
import com.timeflow.entity.TaskStatus;
import com.timeflow.entity.TaskType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    @Query("SELECT t FROM Task t WHERE t.taskStatus IN (:statuses) AND t.scheduledTime <= :now ORDER BY t.scheduledTime ASC")
    List<Task> findDueTasks(@Param("statuses") List<TaskStatus> statuses, @Param("now") LocalDateTime now);

    List<Task> findByTaskTypeOrderByScheduledTimeDesc(TaskType taskType);

    List<Task> findByTaskStatusOrderByScheduledTimeDesc(TaskStatus taskStatus);

    @Query("SELECT t FROM Task t WHERE t.taskType = :taskType AND t.taskStatus = :status ORDER BY t.scheduledTime DESC")
    List<Task> findByTaskTypeAndStatus(@Param("taskType") TaskType taskType, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t WHERE t.taskType = 'ALARM' AND t.taskStatus = 'TRIGGERED' ORDER BY t.scheduledTime DESC")
    List<Task> findActiveTriggeredAlarms();

    long countByTaskStatus(TaskStatus taskStatus);

    long countByScheduledTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.taskType = 'WHATSAPP' AND t.taskStatus = 'SENT'")
    long countDeliveredMessages();

    @Query("SELECT COUNT(t) FROM Task t WHERE t.taskType = 'ALARM' AND t.taskStatus = 'TRIGGERED'")
    long countActiveAlarms();
}
