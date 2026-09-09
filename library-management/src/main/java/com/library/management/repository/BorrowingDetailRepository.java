package com.library.management.repository;

import com.library.management.entity.BorrowingDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BorrowingDetailRepository
        extends JpaRepository<BorrowingDetail, Long> {
}