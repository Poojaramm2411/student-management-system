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
}
