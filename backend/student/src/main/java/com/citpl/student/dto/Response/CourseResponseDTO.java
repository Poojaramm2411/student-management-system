package com.citpl.student.dto.Response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponseDTO {

    private Long id;
    private String courseName;
    private String courseCode;
    private String description;
    private String department;
    private String duration;  // ✅ changed Integer to String
    private String status;

    // Flattened batch info
    private Long batchId;
    private String batchName;

    // ✅ ALL auto-generated stubs removed — Lombok handles everything
}