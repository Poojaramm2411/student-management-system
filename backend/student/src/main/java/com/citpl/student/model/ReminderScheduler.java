package com.citpl.student.model;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.citpl.student.repository.BatchRepository;
import com.citpl.student.repository.EnrollmentRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReminderScheduler {
      private final EnrollmentRepository enrollmentRepository;
    private final BatchRepository batchRepository;
    private final JavaMailSender mailSender;

    private volatile LocalDateTime lastFeeRunAt;
    private volatile LocalDateTime lastBatchRunAt;
    private volatile int lastFeeCount;
    private volatile int lastBatchCount;

    @Scheduled(cron = "${reminders.fee-due-cron}")
    public void sendFeeDueReminders() {
        List<Enrollment> pending = enrollmentRepository.findByFeeStatusIn(List.of("Pending", "Partial"));
        int sent = 0;

        for (Enrollment e : pending) {
            String email = e.getStudent() != null ? e.getStudent().getEmail() : null;
            if (email == null || email.isBlank()) continue;

            double due = safeDouble(e.getTotalFee()) - safeDouble(e.getPaidAmount());

            sendEmail(
                email,
                "Fee Payment Reminder",
                "Dear " + safeName(e) + ",\n\n"
                    + "This is a reminder that your fee for \"" + safeCourse(e)
                    + "\" is still due.\n"
                    + "Balance due: Rs. " + String.format("%.2f", due) + "\n\n"
                    + "Please clear the dues at your earliest convenience.\n\n"
                    + "Regards,\nStudent Management Team"
            );
            sent++;
        }

        lastFeeRunAt = LocalDateTime.now();
        lastFeeCount = sent;
    }

    @Scheduled(cron = "${reminders.batch-start-cron}")
    public void sendBatchStartReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Batch> startingSoon = batchRepository.findByStartDate(tomorrow);
        int sent = 0;

        for (Batch b : startingSoon) {
            // Batch may not expose a getStudents() method; derive students from enrollments
            List<Student> students = enrollmentRepository.findAll().stream()
                    .map(e -> e.getBatch() == null ? null : (e.getBatch().equals(b) ? e.getStudent() : null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (students.isEmpty()) continue;
            for (var student : students) {
                if (student.getEmail() == null || student.getEmail().isBlank()) continue;

                sendEmail(
                    student.getEmail(),
                    "Your Batch Starts Tomorrow",
                    "Hi " + student.getName() + ",\n\n"
                        + "Your batch \"" + b.getBatchName() + "\" starts tomorrow ("
                        + b.getStartDate() + ").\n\n"
                        + "See you there!\n\n"
                        + "Regards,\nStudent Management Team"
                );
                sent++;
            }
        }

        lastBatchRunAt = LocalDateTime.now();
        lastBatchCount = sent;
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception ex) {
            // Log and continue — one bad email shouldn't stop the whole batch
            System.err.println("Failed to send reminder to " + to + ": " + ex.getMessage());
        }
    }

    private double safeDouble(Double d) { return d == null ? 0.0 : d; }
    private String safeName(Enrollment e) { return e.getStudent() != null ? e.getStudent().getName() : "Student"; }
    private String safeCourse(Enrollment e) { return e.getCourse() != null ? e.getCourse().getCourseName() : "your course"; }

    public LocalDateTime getLastFeeRunAt() { return lastFeeRunAt; }
    public LocalDateTime getLastBatchRunAt() { return lastBatchRunAt; }
    public int getLastFeeCount() { return lastFeeCount; }
    public int getLastBatchCount() { return lastBatchCount; }
    
}
