package com.library.management.repository;

import com.library.management.entity.LibraryCardPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface LibraryCardPaymentRepository
        extends JpaRepository<LibraryCardPayment, Long> {

    List<LibraryCardPayment> findByPaidAtBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    @Query("""
        SELECT COALESCE(SUM(p.amount), 0)
        FROM LibraryCardPayment p
        WHERE p.paidAt >= :start
          AND p.paidAt < :end
    """)
    BigDecimal getRevenueBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}