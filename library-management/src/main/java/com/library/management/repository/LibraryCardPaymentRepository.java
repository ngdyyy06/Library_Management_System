package com.library.management.repository;

import com.library.management.entity.LibraryCardPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface LibraryCardPaymentRepository
        extends JpaRepository<LibraryCardPayment, Long> {

    List<LibraryCardPayment> findByPaidAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );
}