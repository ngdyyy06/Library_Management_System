package com.library.management.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "import_receipt_details")
public class ImportReceiptDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "import_receipt_id", nullable = false)
    private ImportReceipt importReceipt;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private BigDecimal amount;

    public ImportReceiptDetail() {
    }

    public ImportReceiptDetail(
            Long id,
            ImportReceipt importReceipt,
            Book book,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal amount) {

        this.id = id;
        this.importReceipt = importReceipt;
        this.book = book;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.amount = amount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ImportReceipt getImportReceipt() {
        return importReceipt;
    }

    public void setImportReceipt(ImportReceipt importReceipt) {
        this.importReceipt = importReceipt;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
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

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}