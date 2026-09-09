package com.library.management.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class CreateReaderRequest {

    @NotBlank
    private String readerCode;

    @NotBlank
    private String fullName;

    @Email
    private String email;

    @NotBlank
    private String phone;

    private String address;

    private LocalDate dateOfBirth;

    public CreateReaderRequest() {
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
}