package com.citpl.student.service.implementation;

import com.citpl.student.dto.Request.AdminRequest;
import com.citpl.student.dto.Response.AdminResponse;
import com.citpl.student.exception.BadRequestException;
import com.citpl.student.exception.ResourceNotFoundException;
import com.citpl.student.model.Admin;
import com.citpl.student.repository.AdminRepo;
import com.citpl.student.security.JwtUtil;
import com.citpl.student.service.AdminService;
import com.citpl.student.util.AdminMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminServiceImpl implements AdminService, UserDetailsService {

    private final AdminRepo adminRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminServiceImpl(AdminRepo adminRepo,
                            PasswordEncoder passwordEncoder,
                            JwtUtil jwtUtil) {
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ── UserDetailsService (Spring Security) ─────────────────────────────────

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Admin admin = adminRepo.findByEmail(email);
        if (admin == null) {
            throw new UsernameNotFoundException("Admin not found with email: " + email);
        }
        return admin;
    }

    // ── Register ──────────────────────────────────────────────────────────────

    @Override
    public AdminResponse register(AdminRequest request) {
        if (adminRepo.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists: " + request.getEmail());
        }

        Admin admin = AdminMapper.mapToEntity(request);
        admin.setPassword(passwordEncoder.encode(request.getPassword()));

        Admin saved = adminRepo.save(admin);

        String token = jwtUtil.generateToken(saved);

        AdminResponse response = AdminMapper.mapToDto(saved);
        response.setToken(token);

        return response;
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Override
    public AdminResponse login(AdminRequest request) {
        Admin admin = adminRepo.findByEmail(request.getEmail());

        if (admin == null) {
            throw new ResourceNotFoundException("Admin not found with email: " + request.getEmail());
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new BadRequestException("Invalid password provided");
        }

        String token = jwtUtil.generateToken(admin);

        AdminResponse response = AdminMapper.mapToDto(admin);
        response.setToken(token);

        return response;
    }

    // ── Get by Email ──────────────────────────────────────────────────────────

    @Override
    public AdminResponse getAdminByEmail(String email) {
        Admin admin = adminRepo.findByEmail(email);
        if (admin == null) {
            throw new ResourceNotFoundException("Admin not found with email: " + email);
        }
        return AdminMapper.mapToDto(admin);
    }

    // ── Update ────────────────────────────────────────────────────────────────

    @Override
    public AdminResponse updateAdmin(String email, AdminRequest request) {
        Admin admin = adminRepo.findByEmail(email);
        if (admin == null) {
            throw new ResourceNotFoundException("Admin not found with email: " + email);
        }

        admin.setName(request.getName());
        admin.setEmail(request.getEmail());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            admin.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return AdminMapper.mapToDto(adminRepo.save(admin));
    }

    @Override
    public void deleteAdmin(String email) {
        Admin admin = adminRepo.findByEmail(email);
        if (admin == null) {
            throw new ResourceNotFoundException("Admin not found with email: " + email);
        }
        adminRepo.delete(admin);
    }
}