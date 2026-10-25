package com.timeflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TimeFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(TimeFlowApplication.class, args);
    }
}
