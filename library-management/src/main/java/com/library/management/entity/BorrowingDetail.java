package com.library.management.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
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
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "good_quantity", nullable = false)
    private Integer goodQuantity = 0;

    @Column(name = "damaged_quantity", nullable = false)
    private Integer damagedQuantity = 0;

    @Column(name = "lost_quantity", nullable = false)
    private Integer lostQuantity = 0;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    @Column(nullable = false)
    private Integer fine = 0;

    @Column(name = "damage_fine", nullable = false)
    private BigDecimal damageFine = BigDecimal.ZERO;

    public BorrowingDetail() {
    }

    public BorrowingDetail(
            Long id,
            Borrowing borrowing,
            Book book,
            Integer quantity,
            Integer goodQuantity,
            Integer damagedQuantity,
            Integer lostQuantity,
            LocalDateTime returnedAt,
            Integer fine,
            BigDecimal damageFine) {

        this.id = id;
        this.borrowing = borrowing;
        this.book = book;
        this.quantity = quantity;
        this.goodQuantity = goodQuantity;
        this.damagedQuantity = damagedQuantity;
        this.lostQuantity = lostQuantity;
        this.returnedAt = returnedAt;
        this.fine = fine;
        this.damageFine = damageFine;
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

    public Integer getGoodQuantity() {
        return goodQuantity;
    }

    public void setGoodQuantity(Integer goodQuantity) {
        this.goodQuantity = goodQuantity;
    }

    public Integer getDamagedQuantity() {
        return damagedQuantity;
    }

    public void setDamagedQuantity(Integer damagedQuantity) {
        this.damagedQuantity = damagedQuantity;
    }

    public Integer getLostQuantity() {
        return lostQuantity;
    }

    public void setLostQuantity(Integer lostQuantity) {
        this.lostQuantity = lostQuantity;
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

    public BigDecimal getDamageFine() {
        return damageFine;
    }

    public void setDamageFine(BigDecimal damageFine) {
        this.damageFine = damageFine;
    }
}