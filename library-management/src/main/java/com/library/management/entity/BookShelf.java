package com.library.management.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "book_shelves")
public class BookShelf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String shelfCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String status;

    public BookShelf() {
    }

    public BookShelf(Long id, String shelfCode, String name, String status) {
        this.id = id;
        this.shelfCode = shelfCode;
        this.name = name;
        this.status = status;
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
}