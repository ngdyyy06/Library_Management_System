package com.library.management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class ImportReceiptDetailRequest {

    /*
     * Existing Book
     *
     * Nếu nhập sách đã tồn tại thì truyền bookId.
     * Nếu tạo sách mới thì bookId để null và truyền newBook.
     */
    private Long bookId;

    /*
     * New Book
     */
    @Valid
    private NewImportBookRequest newBook;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(
            value = "0.0",
            inclusive = true,
            message = "Unit price cannot be negative"
    )
    private BigDecimal unitPrice;

    public ImportReceiptDetailRequest() {
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public NewImportBookRequest getNewBook() {
        return newBook;
    }

    public void setNewBook(NewImportBookRequest newBook) {
        this.newBook = newBook;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
}