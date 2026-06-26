package com.citpl.student.dto.Response;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchResponseDTO {

    private Long id;
    private String batchName;
    private String batchCode;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private Long instructorId;
    private String instructorName;
}