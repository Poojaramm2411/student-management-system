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
    private String duration;
    private Double fee;
    private String status;
}