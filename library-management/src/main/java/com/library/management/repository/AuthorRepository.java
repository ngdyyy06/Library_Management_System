package com.library.management.repository;

import com.library.management.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthorRepository extends JpaRepository<Author, Long> {

    Optional<Author> findByNameIgnoreCase(String name);

    Optional<Author> findFirstByNameIgnoreCase(String authorName);
}