package com.library.management.repository;

import com.library.management.entity.BorrowingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BorrowingDetailRepository
        extends JpaRepository<BorrowingDetail, Long> {

    @Query("""
            SELECT COALESCE(SUM(bd.quantity), 0)
            FROM BorrowingDetail bd
            WHERE bd.borrowing.reader.id = :readerId
            AND bd.returnedAt IS NULL
            """)
    long countUnreturnedBooksByReaderId(
            @Param("readerId") Long readerId
    );

    @Query("""
            SELECT COALESCE(SUM(bd.quantity), 0)
            FROM BorrowingDetail bd
            WHERE bd.borrowing.id = :borrowingId
            AND bd.returnedAt IS NULL
            """)
    long countUnreturnedBooksByBorrowingId(
            @Param("borrowingId") Long borrowingId
    );

    @Query("""
            SELECT COALESCE(SUM(bd.fine), 0)
                   + COALESCE(SUM(bd.damageFine), 0)
            FROM BorrowingDetail bd
            WHERE bd.returnedAt IS NOT NULL
            AND FUNCTION('DATE', bd.returnedAt) = CURRENT_DATE
            """)
    long getTodayFineRevenue();

    @Query("""
            SELECT COALESCE(SUM(bd.fine), 0)
                   + COALESCE(SUM(bd.damageFine), 0)
            FROM BorrowingDetail bd
            WHERE bd.returnedAt IS NOT NULL
            AND YEAR(bd.returnedAt) = YEAR(CURRENT_DATE)
            AND MONTH(bd.returnedAt) = MONTH(CURRENT_DATE)
            """)
    long getMonthlyFineRevenue();

    @Query("""
    SELECT COALESCE(
        SUM(
            bd.goodQuantity
            + bd.damagedQuantity
            + bd.lostQuantity
        ), 0
    )
    FROM BorrowingDetail bd
    WHERE bd.returnedAt IS NOT NULL
    AND FUNCTION('DATE', bd.returnedAt) = CURRENT_DATE
    """)
    long getTodayReturnedBooks();

    List<BorrowingDetail> findByBorrowingId(Long borrowingId);

    long countByReturnedAtIsNotNull();
}