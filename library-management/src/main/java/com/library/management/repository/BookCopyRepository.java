package com.library.management.repository;

import com.library.management.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    boolean existsByBarcode(String barcode);
}