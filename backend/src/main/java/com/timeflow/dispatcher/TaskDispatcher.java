package com.timeflow.dispatcher;

import com.timeflow.entity.Task;
import com.timeflow.entity.TaskType;

public interface TaskDispatcher {
    
    boolean supports(TaskType type);

    void dispatch(Task task);
}
