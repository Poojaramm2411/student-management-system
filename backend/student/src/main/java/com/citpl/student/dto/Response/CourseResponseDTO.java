package com.citpl.student.dto.Response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponseDTO {

    private Long id;
    private String courseName;
    private String courseCode;
    private String description;
    private String department;
    private String duration;
    private Double fee;

    // Batch info - flattened for frontend convenience
    private Long batchId;
    private String batchName;

    // Instructor info
    private Long instructorId;
    private String instructorName;

    private String status;
}