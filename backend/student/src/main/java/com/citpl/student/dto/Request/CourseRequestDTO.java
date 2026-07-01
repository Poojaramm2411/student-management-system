package com.citpl.student.dto.Request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRequestDTO {

    @NotBlank(message = "Course name is required")
    private String courseName;

    @NotBlank(message = "Course code is required")
    private String courseCode;

    private String description;

    private String department;

    @NotBlank(message = "Duration is required")
    private String duration;

    @NotNull(message = "Fee is required")
    @Positive(message = "Fee must be greater than 0")
    private Double fee;

    private Long batchId;

    private Long instructorId;

    private String status; // "ACTIVE" / "INACTIVE"
}