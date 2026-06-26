package com.citpl.student.service;

import com.citpl.student.dto.Request.AdminRequest;
import com.citpl.student.dto.Response.AdminResponse;

public interface AdminService {

    AdminResponse register(AdminRequest request);

    AdminResponse login(AdminRequest request);

    AdminResponse getAdminByEmail(String email);

    AdminResponse updateAdmin(String email, AdminRequest request);

    void deleteAdmin(String email);
}