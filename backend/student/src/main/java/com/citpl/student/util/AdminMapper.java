package com.citpl.student.util;

import com.citpl.student.dto.Request.AdminRequest;
import com.citpl.student.dto.Response.AdminResponse;
import com.citpl.student.model.Admin;

public class AdminMapper {

    public static Admin mapToEntity(AdminRequest request) {

        Admin admin = new Admin();

        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        // admin.setPassword(request.getPassword());

        return admin;
    }

    public static AdminResponse mapToDto(Admin admin) {

        AdminResponse response = new AdminResponse();

        response.setId(admin.getId());
        response.setName(admin.getName());
        response.setEmail(admin.getEmail());

        return response;
    }
}