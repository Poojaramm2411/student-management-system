package com.citpl.student.dto.Request;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchRequestDTO {

    private String batchName;
    private String batchCode;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Long instructorId;  // FK to Instructor
}