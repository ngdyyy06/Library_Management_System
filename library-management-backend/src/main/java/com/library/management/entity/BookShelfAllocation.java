package com.library.management.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "book_shelf_allocations",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"book_id", "shelf_id"}
                )
        }
)
public class BookShelfAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @ManyToOne
    @JoinColumn(name = "shelf_id", nullable = false)
    private BookShelf shelf;

    @Column(nullable = false)
    private Integer quantity;

    public BookShelfAllocation() {
    }

    public BookShelfAllocation(
            Long id,
            Book book,
            BookShelf shelf,
            Integer quantity
    ) {
        this.id = id;
        this.book = book;
        this.shelf = shelf;
        this.quantity = quantity;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public BookShelf getShelf() {
        return shelf;
    }

    public void setShelf(BookShelf shelf) {
        this.shelf = shelf;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}