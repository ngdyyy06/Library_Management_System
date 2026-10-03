package com.library.management.dto;

import jakarta.validation.constraints.Email;

public class UpdateUserRequest {

    private String username;

    private String password;

    private String fullName;

    @Email
    private String email;

    private Long roleId;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(
            String username,
            String password,
            String fullName,
            String email,
            Long roleId
    ) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.roleId = roleId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
}