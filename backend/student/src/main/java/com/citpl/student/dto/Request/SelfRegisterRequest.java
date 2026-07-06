package com.citpl.student.dto.Request;
import lombok.Getter;
import lombok.Setter;
 
@Getter
@Setter
public class SelfRegisterRequest {
    private String email;
    private String password;
}
