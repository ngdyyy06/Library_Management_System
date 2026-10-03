package com.library.management.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class RenewBorrowingRequest {

    @NotNull
    @Min(3)
    @Max(30)
    private Integer days;

    @NotNull
    private Boolean paymentConfirmed;

    public RenewBorrowingRequest() {
    }

    public Integer getDays() {
        return days;
    }

    public void setDays(Integer days) {
        this.days = days;
    }

    public Boolean getPaymentConfirmed() {
        return paymentConfirmed;
    }

    public void setPaymentConfirmed(Boolean paymentConfirmed) {
        this.paymentConfirmed = paymentConfirmed;
    }
}