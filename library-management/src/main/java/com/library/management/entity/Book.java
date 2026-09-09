package com.library.management.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "books")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String isbn;

    private String publisher;

    @Column(name = "publish_year")
    private Integer publishYear;

    @Column(columnDefinition = "TEXT")  //description có thể chứa đoạn văn dài
    private String description;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity; // dùng Integer thay vì int để có thể biểu diễn trạng thái null

    @Column(name = "available_quantity", nullable = false)
    private Integer availableQuantity;  // số lượng còn lại có thể mượn của sách

    @Column(nullable = false)
    private String status;

    @ManyToMany
    @JoinTable(  // dùng bảng book_authors để kết nối Book với Author
            name = "book_authors",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "author_id")
    )

    // dùng set thay list để tránh 1 tác giả xuất hiện 2 lần trong collection
    private Set<Author> authors = new HashSet<>();

    public Book() {
    }

    public Book(Long id, String title, String isbn, String publisher,
                Integer publishYear, String description,
                Integer totalQuantity, Integer availableQuantity, String status) {
        this.id = id;
        this.title = title;
        this.isbn = isbn;
        this.publisher = publisher;
        this.publishYear = publishYear;
        this.description = description;
        this.totalQuantity = totalQuantity;
        this.availableQuantity = availableQuantity;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getIsbn() {
        return isbn;
    }

    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public Integer getPublishYear() {
        return publishYear;
    }

    public void setPublishYear(Integer publishYear) {
        this.publishYear = publishYear;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public Integer getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(Integer availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public Set<Author> getAuthors() {
        return authors;
    }

    public void setAuthors(Set<Author> authors) {
        this.authors = authors;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}