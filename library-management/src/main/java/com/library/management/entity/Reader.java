package com.library.management.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "readers")
public class Reader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã thẻ thành viên
    @Column(name = "reader_code", nullable = false, unique = true)
    private String readerCode;

    // Họ và tên
    @Column(name = "full_name", nullable = false)
    private String fullName;

    // Email
    @Column(unique = true)
    private String email;

    // Số điện thoại
    @Column(nullable = false)
    private String phone;

    // Địa chỉ
    private String address;

    // Ngày sinh
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    // Trạng thái thẻ thành viên
    @Column(nullable = false)
    private String status;

    // Thời điểm tạo thẻ
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Reader() {
    }

    public Reader(
            Long id,
            String readerCode,
            String fullName,
            String email,
            String phone,
            String address,
            LocalDate dateOfBirth,
            String status,
            LocalDateTime createdAt
    ) {
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