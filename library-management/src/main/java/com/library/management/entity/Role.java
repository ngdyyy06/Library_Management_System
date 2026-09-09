package com.library.management.entity;

import jakarta.persistence.*;

@Entity // nói cho JPA biết class Role này là 1 Entity và cần đc ánh xạ xuống database
@Table(name = "roles")   // class Role này = bảng roles trong mySQL
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // database tự tăng stt ID
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    public Role() {
    }

    public Role(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}