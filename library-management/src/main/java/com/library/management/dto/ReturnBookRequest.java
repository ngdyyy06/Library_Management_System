package com.library.management.dto;

import jakarta.validation.constraints.NotBlank;

public class ReturnBookRequest {

    @NotBlank
    private String condition;

    public ReturnBookRequest() {
    }

    public ReturnBookRequest(String condition) {
        this.condition = condition;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }
}