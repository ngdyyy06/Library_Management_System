package com.library.management.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "return_histories")
public class ReturnHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(
            name = "borrowing_detail_id",
            nullable = false
    )
    private BorrowingDetail borrowingDetail;

    @ManyToOne
    @JoinColumn(
            name = "borrowing_id",
            nullable = false
    )
    private Borrowing borrowing;

    @ManyToOne
    @JoinColumn(
            name = "book_id",
            nullable = false
    )
    private Book book;

    @Column(
            name = "good_quantity",
            nullable = false
    )
    private Integer goodQuantity;

    @Column(
            name = "damaged_quantity",
            nullable = false
    )
    private Integer damagedQuantity;

    @Column(
            name = "lost_quantity",
            nullable = false
    )
    private Integer lostQuantity;

    @Column(
            nullable = false
    )
    private Integer fine;

    @Column(
            name = "damage_fine",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal damageFine;

    @Column(
            name = "returned_at",
            nullable = false
    )
    private LocalDateTime returnedAt;

    // RETURNED / PARTIALLY_RETURNED
    @Column(
            nullable = false
    )
    private String status;

    public ReturnHistory() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BorrowingDetail getBorrowingDetail() {
        return borrowingDetail;
    }

    public void setBorrowingDetail(
            BorrowingDetail borrowingDetail) {

        this.borrowingDetail = borrowingDetail;
    }

    public Borrowing getBorrowing() {
        return borrowing;
    }

    public void setBorrowing(
            Borrowing borrowing) {

        this.borrowing = borrowing;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public Integer getGoodQuantity() {
        return goodQuantity;
    }

    public void setGoodQuantity(
            Integer goodQuantity) {

        this.goodQuantity = goodQuantity;
    }

    public Integer getDamagedQuantity() {
        return damagedQuantity;
    }

    public void setDamagedQuantity(
            Integer damagedQuantity) {

        this.damagedQuantity = damagedQuantity;
    }

    public Integer getLostQuantity() {
        return lostQuantity;
    }

    public void setLostQuantity(
            Integer lostQuantity) {

        this.lostQuantity = lostQuantity;
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

    public void setDamageFine(
            BigDecimal damageFine) {

        this.damageFine = damageFine;
    }

    public LocalDateTime getReturnedAt() {
        return returnedAt;
    }

    public void setReturnedAt(
            LocalDateTime returnedAt) {

        this.returnedAt = returnedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status) {

        this.status = status;
    }
}