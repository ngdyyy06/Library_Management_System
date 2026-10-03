package com.library.management.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "renewal_payments")
public class RenewalPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "borrowing_id", nullable = false)
    private Borrowing borrowing;

    @Column(nullable = false)
    private Integer days;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    public RenewalPayment() {
    }

    public RenewalPayment(
            Long id,
            Borrowing borrowing,
            Integer days,
            BigDecimal amount,
            LocalDateTime paidAt) {

        this.id = id;
        this.borrowing = borrowing;
        this.days = days;
        this.amount = amount;
        this.paidAt = paidAt;
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

    public Integer getDays() {
        return days;
    }

    public void setDays(Integer days) {
        this.days = days;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getPaidAt() {
        return paidAt;
    }

    public void setPaidAt(LocalDateTime paidAt) {
        this.paidAt = paidAt;
    }
}