package com.library.management.repository;

import com.library.management.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    boolean existsByBarcode(String barcode);

    long countByBookIdAndStatus(Long bookId, String status);

    List<BookCopy> findByBookId(Long bookId);
}