package com.timeflow.dispatcher;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timeflow.entity.Task;
import com.timeflow.entity.TaskStatus;
import com.timeflow.entity.TaskType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@Component
public class WhatsAppDispatcher implements TaskDispatcher {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppDispatcher.class);
    private static final String GATEWAY_URL = "http://localhost:3000/send-whatsapp";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public WhatsAppDispatcher() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public boolean supports(TaskType type) {
        return TaskType.WHATSAPP.equals(type);
    }

    @Override
    public void dispatch(Task task) {
        log.info("================================================================================");
        log.info("[WHATSAPP WEB GATEWAY] Initiating WhatsApp dispatch to: {}", task.getRecipient());
        log.info("Message body: \"{}\"", task.getMessageBody());

        try {
            String jsonPayload = objectMapper.writeValueAsString(Map.of(
                    "to", task.getRecipient() != null ? task.getRecipient() : "",
                    "message", task.getMessageBody() != null ? task.getMessageBody() : ""
            ));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GATEWAY_URL))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            boolean isDelivered = (response.statusCode() >= 200 && response.statusCode() < 300) 
                    || (response.body() != null && response.body().contains("\"success\":true"));

            if (isDelivered) {
                log.info("[WHATSAPP WEB GATEWAY] Message delivered successfully via Node.js Gateway: {}", response.body());
                task.setTaskStatus(TaskStatus.SENT);
                task.setDispatchedAt(LocalDateTime.now());
                task.setDispatchResult(String.format("Delivered to %s", task.getRecipient()));
            } else {
                log.warn("[WHATSAPP WEB GATEWAY] Gateway responded with error (status {}): {}", response.statusCode(), response.body());
                task.setTaskStatus(TaskStatus.FAILED);
                task.setDispatchedAt(LocalDateTime.now());
                task.setDispatchResult(String.format("Failed to deliver to %s", task.getRecipient()));
            }
        } catch (Exception e) {
            log.warn("[WHATSAPP WEB GATEWAY] Error sending via Node.js gateway at {}: {}", GATEWAY_URL, e.getMessage());
            task.setTaskStatus(TaskStatus.FAILED);
            task.setDispatchedAt(LocalDateTime.now());
            task.setDispatchResult(String.format("Could not connect to send to %s", task.getRecipient()));
        }
        log.info("================================================================================");
    }
}
