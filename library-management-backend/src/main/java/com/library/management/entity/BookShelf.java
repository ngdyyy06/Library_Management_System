package com.library.management.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

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

    @JsonIgnore
    @OneToMany(
            mappedBy = "shelf",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<BookShelfAllocation> allocations = new ArrayList<>();

    @JsonIgnoreProperties("defaultShelf")
    @ManyToMany
    @JoinTable(
            name = "book_shelf_categories",
            joinColumns = @JoinColumn(name = "shelf_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories = new ArrayList<>();

    public BookShelf() {
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

    public List<BookShelfAllocation> getAllocations() {
        return allocations;
    }

    public void setAllocations(List<BookShelfAllocation> allocations) {
        this.allocations = allocations;
    }

    public List<Category> getCategories() {
        return categories;
    }

    public void setCategories(List<Category> categories) {
        this.categories = categories;
    }
}