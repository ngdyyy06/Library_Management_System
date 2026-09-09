package com.library.management.repository;

import com.library.management.entity.Borrowing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BorrowingRepository extends JpaRepository<Borrowing, Long> {
}