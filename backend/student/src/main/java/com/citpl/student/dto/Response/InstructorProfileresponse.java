package com.citpl.student.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class InstructorProfileresponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private String status;
}