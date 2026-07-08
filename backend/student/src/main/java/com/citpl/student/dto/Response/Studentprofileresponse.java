package com.citpl.student.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class Studentprofileresponse {
    private Long id;
    private String name;
    private String email;
    private Integer age;
    private String studentCode;
    private String city;
    private String status;
    private String batchName;
    private String batchCode;
    private String courseName;
}