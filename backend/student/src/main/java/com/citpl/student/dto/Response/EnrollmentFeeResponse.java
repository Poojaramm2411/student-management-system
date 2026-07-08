package com.citpl.student.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class EnrollmentFeeResponse {
    private Long id;
    private String courseName;
    private String batchName;
    private Double baseFee;
    private Double gstAmount;
    private Double totalFee;
    private Double paidAmount;
    private Double balanceDue;
    private String feeStatus;     // Paid / Pending / Partial
    private String paymentMode;
    private String enrolledDate;
}