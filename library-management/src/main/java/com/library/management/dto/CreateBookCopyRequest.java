package com.library.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateBookCopyRequest {

    @NotBlank
    private String barcode;

    @NotNull
    private Long bookId;

    public CreateBookCopyRequest() {
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }
}