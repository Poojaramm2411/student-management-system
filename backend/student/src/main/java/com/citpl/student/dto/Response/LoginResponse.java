package com.citpl.student.dto.Response;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
 
@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
      private String token;
    private String role;   // "ADMIN" | "STUDENT" | "INSTRUCTOR"
    private String name;
    private String email;
}
