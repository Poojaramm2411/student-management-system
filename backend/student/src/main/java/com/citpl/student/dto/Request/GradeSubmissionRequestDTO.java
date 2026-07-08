package com.citpl.student.dto.Request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradeSubmissionRequestDTO {

    private Long instructorId;   // who is grading (from the logged-in instructor)
    private Integer marksObtained;
    private String feedback;
}