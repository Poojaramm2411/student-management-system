package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.AdminRequest;
import com.citpl.student.dto.Response.AdminResponse;
import com.citpl.student.model.Admin;
import com.citpl.student.model.Status;
import com.citpl.student.repository.AdminRepository;
import com.citpl.student.security.JwtUtil;
import com.citpl.student.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public AdminResponse register(AdminRequest request) {
        if (adminRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("An admin with this email already exists");
        }

        Admin admin = Admin.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .status(Status.ACTIVE)
                .build();

        Admin saved = adminRepository.save(admin);
        String token = jwtUtil.generateToken(saved.getEmail(), "ADMIN");

        return AdminResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .email(saved.getEmail())
                .token(token)
                .status(saved.getStatus().name())
                .build();
    }

    @Override
    public AdminResponse login(AdminRequest request) {
        Admin admin = findByEmail(request.getEmail());

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN");

        return AdminResponse.builder()
                .id(admin.getId())
                .name(admin.getName())
                .email(admin.getEmail())
                .token(token)
                .status(admin.getStatus().name())
                .build();
    }

    @Override
    public AdminResponse getAdminByEmail(String email) {
        Admin admin = findByEmail(email);
        return AdminResponse.builder()
                .id(admin.getId())
                .name(admin.getName())
                .email(admin.getEmail())
                .status(admin.getStatus().name())
                .build();
    }

    @Override
    public AdminResponse updateAdmin(String email, AdminRequest request) {
        Admin admin = findByEmail(email);

        if (request.getName() != null && !request.getName().isBlank()) {
            admin.setName(request.getName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            admin.setEmail(request.getEmail().trim());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Admin updated = adminRepository.save(admin);

        return AdminResponse.builder()
                .id(updated.getId())
                .name(updated.getName())
                .email(updated.getEmail())
                .status(updated.getStatus().name())
                .build();
    }

    @Override
    public void deleteAdmin(String email) {
        adminRepository.delete(findByEmail(email));
    }

    private Admin findByEmail(String email) {
        return adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No admin found with email: " + email));
    }
}