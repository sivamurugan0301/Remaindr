package com.timeflow.dispatcher;

import com.timeflow.entity.Task;
import com.timeflow.entity.TaskStatus;
import com.timeflow.entity.TaskType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AlarmDispatcher implements TaskDispatcher {

    private static final Logger log = LoggerFactory.getLogger(AlarmDispatcher.class);

    @Override
    public boolean supports(TaskType type) {
        return TaskType.ALARM.equals(type);
    }

    @Override
    public void dispatch(Task task) {
        log.info("================================================================================");
        log.info("[AUDIBLE ALARM DISPATCHER] Alarm triggered and ringing!");
        log.info("Alarm ID   : {}", task.getId());
        log.info("Title      : {}", task.getTitle());
        log.info("Note       : {}", task.getMessageBody());
        log.info("Tone       : {}", task.getRingTone());
        log.info("Scheduled  : {}", task.getScheduledTime());

        // Mark as TRIGGERED so the frontend picks it up for audible ringing and banner display
        task.setTaskStatus(TaskStatus.TRIGGERED);
        task.setDispatchedAt(LocalDateTime.now());
        task.setDispatchResult("Alarm ringing");

        log.info("[AUDIBLE ALARM DISPATCHER] Status set to TRIGGERED. Audio playback dispatched to frontend clients.");
        log.info("================================================================================");
    }
}
