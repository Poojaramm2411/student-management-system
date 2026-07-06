package com.citpl.student.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.citpl.student.model.ReminderScheduler;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/reminders")
@RequiredArgsConstructor
public class ReminderController {
    private final ReminderScheduler scheduler;

    @PostMapping("/run-fee")
    public ResponseEntity<?> runFeeNow() {
        scheduler.sendFeeDueReminders();
        return ResponseEntity.ok(Map.of(
            "status", "Fee reminders sent",
            "count", scheduler.getLastFeeCount(),
            "at", scheduler.getLastFeeRunAt()
        ));
    }

    @PostMapping("/run-batch")
    public ResponseEntity<?> runBatchNow() {
        scheduler.sendBatchStartReminders();
        return ResponseEntity.ok(Map.of(
            "status", "Batch reminders sent",
            "count", scheduler.getLastBatchCount(),
            "at", scheduler.getLastBatchRunAt()
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<?> status() {
        return ResponseEntity.ok(Map.of(
            "lastFeeRunAt", scheduler.getLastFeeRunAt(),
            "lastFeeCount", scheduler.getLastFeeCount(),
            "lastBatchRunAt", scheduler.getLastBatchRunAt(),
            "lastBatchCount", scheduler.getLastBatchCount()
        ));
    }
    
}
