package com.citpl.student.dto.Request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstructorRequestDTO {

    private String name;
    private String email;
    private String phone;
    private String specialization;
    private String status;
}