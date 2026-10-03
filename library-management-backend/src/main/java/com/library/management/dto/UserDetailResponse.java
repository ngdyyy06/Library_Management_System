package com.library.management.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDetailResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private String status;

    private ReaderInfo reader;
    private StaffInfo staff;

    public UserDetailResponse() {
    }

    public UserDetailResponse(
            Long id,
            String username,
            String fullName,
            String email,
            String role,
            String status,
            ReaderInfo reader,
            StaffInfo staff) {

        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.status = status;
        this.reader = reader;
        this.staff = staff;
    }

    // =========================
    // Reader Information
    // =========================

    public static class ReaderInfo {

        private Long id;
        private String readerCode;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private LocalDate dateOfBirth;
        private String status;
        private LocalDateTime createdAt;

        public ReaderInfo() {
        }

        public ReaderInfo(
                Long id,
                String readerCode,
                String fullName,
                String email,
                String phone,
                String address,
                LocalDate dateOfBirth,
                String status,
                LocalDateTime createdAt) {

            this.id = id;
            this.readerCode = readerCode;
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.address = address;
            this.dateOfBirth = dateOfBirth;
            this.status = status;
            this.createdAt = createdAt;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getReaderCode() {
            return readerCode;
        }

        public void setReaderCode(String readerCode) {
            this.readerCode = readerCode;
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

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public LocalDate getDateOfBirth() {
            return dateOfBirth;
        }

        public void setDateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }

    // =========================
    // Staff Information
    // =========================

    public static class StaffInfo {

        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private LocalDate dateOfBirth;
        private String status;

        public StaffInfo() {
        }

        public StaffInfo(
                Long id,
                String fullName,
                String email,
                String phone,
                String address,
                LocalDate dateOfBirth,
                String status) {

            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.address = address;
            this.dateOfBirth = dateOfBirth;
            this.status = status;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
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

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public LocalDate getDateOfBirth() {
            return dateOfBirth;
        }

        public void setDateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    // =========================
    // User Information
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public ReaderInfo getReader() {
        return reader;
    }

    public void setReader(ReaderInfo reader) {
        this.reader = reader;
    }

    public StaffInfo getStaff() {
        return staff;
    }

    public void setStaff(StaffInfo staff) {
        this.staff = staff;
    }
}