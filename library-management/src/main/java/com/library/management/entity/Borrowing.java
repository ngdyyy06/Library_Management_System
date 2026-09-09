package com.library.management.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "borrowings")
public class Borrowing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reader_id", nullable = false)
    private Reader reader;

    @Column(name = "borrowed_at", nullable = false)
    private LocalDateTime borrowedAt;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;  // k hiện giờ phút giây

    @Column(nullable = false)
    private String status;

    public Borrowing() {
    }

    public Borrowing(Long id, Reader reader,
                     LocalDateTime borrowedAt,
                     LocalDate dueDate,
                     String status) {
        this.id = id;
        this.reader = reader;
        this.borrowedAt = borrowedAt;
        this.dueDate = dueDate;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reader getReader() {
        return reader;
    }

    public void setReader(Reader reader) {
        this.reader = reader;
    }

    public LocalDateTime getBorrowedAt() {
        return borrowedAt;
    }

    public void setBorrowedAt(LocalDateTime borrowedAt) {
        this.borrowedAt = borrowedAt;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}