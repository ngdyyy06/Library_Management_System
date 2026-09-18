package com.library.management.repository;

import com.library.management.entity.BorrowRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowRequestRepository
        extends JpaRepository<BorrowRequest, Long> {

    List<BorrowRequest> findByReaderId(Long readerId);

    List<BorrowRequest> findByStatus(String status);
}