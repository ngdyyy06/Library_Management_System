package com.library.management.dto;

import java.util.List;

public class BookShelfDetailResponse {

    private Long id;
    private String shelfCode;
    private String name;
    private String status;

    private int usedCapacity;
    private int maxCapacity;
    private int availableCapacity;

    private List<BookAllocationResponse> books;

    public BookShelfDetailResponse() {
    }

    public BookShelfDetailResponse(
            Long id,
            String shelfCode,
            String name,
            String status,
            int usedCapacity,
            int maxCapacity,
            int availableCapacity,
            List<BookAllocationResponse> books
    ) {
        this.id = id;
        this.shelfCode = shelfCode;
        this.name = name;
        this.status = status;
        this.usedCapacity = usedCapacity;
        this.maxCapacity = maxCapacity;
        this.availableCapacity = availableCapacity;
        this.books = books;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getShelfCode() {
        return shelfCode;
    }

    public void setShelfCode(String shelfCode) {
        this.shelfCode = shelfCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getUsedCapacity() {
        return usedCapacity;
    }

    public void setUsedCapacity(int usedCapacity) {
        this.usedCapacity = usedCapacity;
    }

    public int getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(int maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public int getAvailableCapacity() {
        return availableCapacity;
    }

    public void setAvailableCapacity(int availableCapacity) {
        this.availableCapacity = availableCapacity;
    }

    public List<BookAllocationResponse> getBooks() {
        return books;
    }

    public void setBooks(List<BookAllocationResponse> books) {
        this.books = books;
    }

    public static class BookAllocationResponse {

        private Long bookId;
        private String title;
        private String isbn;
        private Integer quantity;

        public BookAllocationResponse() {
        }

        public BookAllocationResponse(
                Long bookId,
                String title,
                String isbn,
                Integer quantity
        ) {
            this.bookId = bookId;
            this.title = title;
            this.isbn = isbn;
            this.quantity = quantity;
        }

        public Long getBookId() {
            return bookId;
        }

        public void setBookId(Long bookId) {
            this.bookId = bookId;
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

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}