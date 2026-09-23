package com.library.management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ReturnBookRequest {

    @NotNull
    @Min(0)
    private Integer goodQuantity;

    @NotNull
    @Min(0)
    private Integer damagedQuantity;

    @NotNull
    @Min(0)
    private Integer lostQuantity;

    public ReturnBookRequest() {
    }

    public ReturnBookRequest(
            Integer goodQuantity,
            Integer damagedQuantity,
            Integer lostQuantity) {

        this.goodQuantity = goodQuantity;
        this.damagedQuantity = damagedQuantity;
        this.lostQuantity = lostQuantity;
    }

    public Integer getGoodQuantity() {
        return goodQuantity;
    }

    public void setGoodQuantity(Integer goodQuantity) {
        this.goodQuantity = goodQuantity;
    }

    public Integer getDamagedQuantity() {
        return damagedQuantity;
    }

    public void setDamagedQuantity(Integer damagedQuantity) {
        this.damagedQuantity = damagedQuantity;
    }

    public Integer getLostQuantity() {
        return lostQuantity;
    }

    public void setLostQuantity(Integer lostQuantity) {
        this.lostQuantity = lostQuantity;
    }
}