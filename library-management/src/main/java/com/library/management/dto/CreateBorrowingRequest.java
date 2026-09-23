package com.library.management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public class CreateBorrowingRequest {

    @NotNull
    private Long readerId;

    @Valid
    @NotEmpty
    private List<BookBorrowItem> books;

    public CreateBorrowingRequest() {
    }

    public Long getReaderId() {
        return readerId;
    }

    public void setReaderId(Long readerId) {
        this.readerId = readerId;
    }

    public List<BookBorrowItem> getBooks() {
        return books;
    }

    public void setBooks(List<BookBorrowItem> books) {
        this.books = books;
    }

    public static class BookBorrowItem {

        @NotNull
        private Long bookId;

        @NotNull
        @Positive
        private Integer quantity;

        public BookBorrowItem() {
        }

        public Long getBookId() {
            return bookId;
        }

        public void setBookId(Long bookId) {
            this.bookId = bookId;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}