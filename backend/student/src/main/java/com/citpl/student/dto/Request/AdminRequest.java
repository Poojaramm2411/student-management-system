package com.citpl.student.dto.Request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRequest {

    private String name;
    private String email;
    private String password;
}