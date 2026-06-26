package com.citpl.student.dto.Response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstructorResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private String status;
}