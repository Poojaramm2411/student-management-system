package com.citpl.student.service;

import com.citpl.student.dto.Request.LoginRequest;
import com.citpl.student.dto.Request.SelfRegisterRequest;
import com.citpl.student.dto.Response.LoginResponse;
import com.citpl.student.model.Admin;
import com.citpl.student.model.Instructor;
import com.citpl.student.model.Student;
import com.citpl.student.repository.InstructorRepository;
import com.citpl.student.repository.AdminRepository;
import com.citpl.student.repository.StudentRepository;
import com.citpl.student.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final InstructorRepository instructorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Unified login — checks Admin first, then Student, then Instructor,
     * all matched by email. Whoever owns that email and whose password
     * matches gets a token carrying their role.
     */
    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        String rawPassword = request.getPassword();

        Optional<Admin> adminOpt = adminRepository.findAll()
            .stream()
            .filter(a -> a.getEmail() != null && email.equalsIgnoreCase(a.getEmail().trim()))
            .findFirst();
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (!passwordEncoder.matches(rawPassword, admin.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }
            String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN");
            return new LoginResponse(token, "ADMIN", admin.getName(), admin.getEmail());
        }

        Optional<Student> studentOpt = studentRepository.findAll()
            .stream()
            .filter(s -> s.getEmail() != null && email.equalsIgnoreCase(s.getEmail().trim()))
            .findFirst();
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            if (student.getPassword() == null) {
                throw new RuntimeException("This account isn't activated yet. Please sign up first.");
            }
            if (!passwordEncoder.matches(rawPassword, student.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }
            // ADDED — record this login so admin can see recent student activity
            student.setLastLoginAt(LocalDateTime.now());
            studentRepository.save(student);

            String token = jwtUtil.generateToken(student.getEmail(), "STUDENT");
            return new LoginResponse(token, "STUDENT", student.getName(), student.getEmail());
        }

        Optional<Instructor> instructorOpt = instructorRepository.findAll()
            .stream()
            .filter(i -> i.getEmail() != null && email.equalsIgnoreCase(i.getEmail().trim()))
            .findFirst();
        if (instructorOpt.isPresent()) {
            Instructor instructor = instructorOpt.get();
            if (instructor.getPassword() == null) {
                throw new RuntimeException("This account isn't activated yet. Please sign up first.");
            }
            if (!passwordEncoder.matches(rawPassword, instructor.getPassword())) {
                throw new RuntimeException("Invalid email or password");
            }
            // ADDED — record this login so admin can see recent instructor activity
            instructor.setLastLoginAt(LocalDateTime.now());
            instructorRepository.save(instructor);

            String token = jwtUtil.generateToken(instructor.getEmail(), "INSTRUCTOR");
            return new LoginResponse(token, "INSTRUCTOR", instructor.getName(), instructor.getEmail());
        }

        throw new RuntimeException("No account found with this email");
    }

    /**
     * Self-registration for a Student. The Student record must already
     * exist (created by Admin) and must not already have a password set —
     * this "claims" the account rather than creating a new one.
     */
    public String registerStudent(SelfRegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        Student student = studentRepository.findAll()
            .stream()
            .filter(s -> s.getEmail() != null && email.equalsIgnoreCase(s.getEmail().trim()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException(
                "No student record found with this email. Please contact your admin."));

        if (student.getPassword() != null) {
            throw new RuntimeException("This account is already registered. Please log in instead.");
        }

        student.setPassword(passwordEncoder.encode(request.getPassword()));
        studentRepository.save(student);
        return "Account activated successfully. You can now log in.";
    }

    /**
     * Self-registration for an Instructor. Same "claim an existing record"
     * pattern as registerStudent above.
     */
    public String registerInstructor(SelfRegisterRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        Instructor instructor = instructorRepository.findAll()
            .stream()
            .filter(i -> i.getEmail() != null && email.equalsIgnoreCase(i.getEmail().trim()))
            .findFirst()
            .orElseThrow(() -> new RuntimeException(
                "No instructor record found with this email. Please contact your admin."));

        if (instructor.getPassword() != null) {
            throw new RuntimeException("This account is already registered. Please log in instead.");
        }

        instructor.setPassword(passwordEncoder.encode(request.getPassword()));
        instructorRepository.save(instructor);
        return "Account activated successfully. You can now log in.";
    }
}