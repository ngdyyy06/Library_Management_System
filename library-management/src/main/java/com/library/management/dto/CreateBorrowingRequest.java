package com.library.management.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateBorrowingRequest {

    @NotNull
    private Long readerId;

    @NotEmpty
    private List<Long> bookCopyIds;

    public CreateBorrowingRequest() {
    }

    public Long getReaderId() {
        return readerId;
    }

    public void setReaderId(Long readerId) {
        this.readerId = readerId;
    }

    public List<Long> getBookCopyIds() {
        return bookCopyIds;
    }

    public void setBookCopyIds(List<Long> bookCopyIds) {
        this.bookCopyIds = bookCopyIds;
    }
}