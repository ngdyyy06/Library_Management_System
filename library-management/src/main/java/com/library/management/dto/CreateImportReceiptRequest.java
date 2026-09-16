package com.library.management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

public class CreateImportReceiptRequest {

    @NotNull(message = "Publisher is required")
    private Long publisherId;

    @NotNull(message = "Import date is required")
    private LocalDate importDate;

    @NotEmpty(message = "Import receipt must contain at least one book")
    @Valid
    private List<ImportReceiptDetailRequest> details;

    public CreateImportReceiptRequest() {
    }

    public Long getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(Long publisherId) {
        this.publisherId = publisherId;
    }

    public LocalDate getImportDate() {
        return importDate;
    }

    public void setImportDate(LocalDate importDate) {
        this.importDate = importDate;
    }

    public List<ImportReceiptDetailRequest> getDetails() {
        return details;
    }

    public void setDetails(List<ImportReceiptDetailRequest> details) {
        this.details = details;
    }
}