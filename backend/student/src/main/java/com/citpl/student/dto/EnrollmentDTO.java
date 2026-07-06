package com.citpl.student.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnrollmentDTO {

    private Long id;
    private Long studentId;
    private Long courseId;
    private Long batchId;
    private String studentName;
    // Only used when studentId is null (i.e. the typed name didn't match an
    // existing student) — carries the extra details needed to create a real
    // Student record instead of an auto-generated placeholder.
    private String studentEmail;
    private Integer studentAge;
    private String studentCity;
    private String courseName;
    private String batchName;
    private Double baseFee;
    private Double gstAmount;
    private Double totalFee;
    private Double paidAmount;
    private String feeStatus;
    private String paymentMode;
    private LocalDate enrolledDate;
    private String status;

    // Payment mode detail fields — optional, populated depending on paymentMode
    private String cardNumber;
    private String upiId;
    private String accountNumber;
    private String chequeNumber;
}