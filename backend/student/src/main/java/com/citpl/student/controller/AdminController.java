package com.citpl.student.controller;

import com.citpl.student.dto.Request.AdminRequest;
import com.citpl.student.dto.Response.AdminResponse;
import com.citpl.student.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // POST /api/admin/register
    @PostMapping("/register")
    public ResponseEntity<AdminResponse> register(@RequestBody AdminRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.register(request));
    }

    // POST /api/admin/login
    @PostMapping("/login")
    public ResponseEntity<AdminResponse> login(@RequestBody AdminRequest request) {
        return ResponseEntity.ok(adminService.login(request));
    }

    // GET /api/admin/get/{email}
    @GetMapping("/get/{email}")
    public ResponseEntity<AdminResponse> getAdminByEmail(@PathVariable String email) {
        return ResponseEntity.ok(adminService.getAdminByEmail(email));
    }

    // PUT /api/admin/update/{email}
    @PutMapping("/update/{email}")
    public ResponseEntity<AdminResponse> updateAdmin(@PathVariable String email,
                                                      @RequestBody AdminRequest request) {
        return ResponseEntity.ok(adminService.updateAdmin(email, request));
    }

    // DELETE /api/admin/delete/{email}
    @DeleteMapping("/delete/{email}")
    public ResponseEntity<String> deleteAdmin(@PathVariable String email) {
        adminService.deleteAdmin(email);
        return ResponseEntity.ok("Admin Deleted Successfully");
    }
}