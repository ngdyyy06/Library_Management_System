package com.library.management.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateBookRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String isbn;

    private String publisher;

    private Integer publishYear;

    private String description;

    private List<Long> authorIds;

    @NotNull
    @Min(0)  // số lượng k dc nhỏ hơn 0
    private Integer totalQuantity;

    public CreateBookRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public Integer getPublishYear() {
        return publishYear;
    }

    public void setPublishYear(Integer publishYear) {
        this.publishYear = publishYear;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public List<Long> getAuthorIds() {
        return authorIds;
    }

    public void setAuthorIds(List<Long> authorIds) {
        this.authorIds = authorIds;
    }
}