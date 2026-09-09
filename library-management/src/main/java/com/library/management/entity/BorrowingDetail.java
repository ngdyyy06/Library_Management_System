package com.library.management.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "borrowing_details")
public class BorrowingDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "borrowing_id", nullable = false)
    private Borrowing borrowing;

    @ManyToOne
    @JoinColumn(name = "book_copy_id", nullable = false)
    private BookCopy bookCopy;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(nullable = false)
    private Integer fine = 0;  // tiền phạt mặc định = 0

    public BorrowingDetail() {
    }

    public BorrowingDetail(Long id,
                           Borrowing borrowing,
                           BookCopy bookCopy,
                           LocalDateTime returnedAt,
                           Integer fine) {
        this.id = id;
        this.borrowing = borrowing;
        this.bookCopy = bookCopy;
        this.returnedAt = returnedAt;
        this.fine = fine;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Borrowing getBorrowing() {
        return borrowing;
    }

    public void setBorrowing(Borrowing borrowing) {
        this.borrowing = borrowing;
    }

    public BookCopy getBookCopy() {
        return bookCopy;
    }

    public void setBookCopy(BookCopy bookCopy) {
        this.bookCopy = bookCopy;
    }

    public LocalDateTime getReturnedAt() {
        return returnedAt;
    }

    public void setReturnedAt(LocalDateTime returnedAt) {
        this.returnedAt = returnedAt;
    }

    public Integer getFine() {
        return fine;
    }

    public void setFine(Integer fine) {
        this.fine = fine;
    }
}