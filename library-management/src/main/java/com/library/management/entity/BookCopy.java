package com.library.management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "book_copies")
public class BookCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String barcode; // mã từng quyển của 1 sách

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne
    @JoinColumn(name = "import_receipt_detail_id")
    private ImportReceiptDetail importReceiptDetail;

    @Column(nullable = false)
    private String status;

    public BookCopy() {
    }

    public BookCopy(
            Long id,
            String barcode,
            Book book,
            ImportReceiptDetail importReceiptDetail,
            String status) {

        this.id = id;
        this.barcode = barcode;
        this.book = book;
        this.importReceiptDetail = importReceiptDetail;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public ImportReceiptDetail getImportReceiptDetail() {
        return importReceiptDetail;
    }

    public void setImportReceiptDetail(ImportReceiptDetail importReceiptDetail) {
        this.importReceiptDetail = importReceiptDetail;
    }
}