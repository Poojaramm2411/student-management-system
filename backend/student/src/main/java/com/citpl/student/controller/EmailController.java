package com.citpl.student.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.citpl.student.dto.Request.NotificationRequest;
import com.citpl.student.service.EmailService;

@RestController
@RequestMapping("/api/notifications")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendNotification(@RequestBody NotificationRequest request) {
        emailService.sendNotification(request.getTo(), request.getSubject(), request.getMessage());
        return ResponseEntity.ok("Notification sent");
    }

}
