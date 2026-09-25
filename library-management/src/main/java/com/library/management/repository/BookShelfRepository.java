package com.library.management.repository;

import com.library.management.entity.BookShelf;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookShelfRepository extends JpaRepository<BookShelf, Long> {

    Optional<BookShelf> findByShelfCode(String shelfCode);

    boolean existsByShelfCode(String shelfCode);
}