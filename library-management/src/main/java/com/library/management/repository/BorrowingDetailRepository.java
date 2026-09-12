package com.library.management.repository;

import com.library.management.entity.BorrowingDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BorrowingDetailRepository
        extends JpaRepository<BorrowingDetail, Long> {
    @Query("""
            SELECT COUNT(bd)
            FROM BorrowingDetail bd
            Where bd.borrowing.reader.id = :readerId
            and bd.returnedAt is null
            """)

    // đếm số bản sách mà Reader đang giữ và chua trả trong tổng phiếu mượn/1 người
    long countUnreturnedBooksByReaderId(@Param("readerId") Long readerId);

    @Query("""
        SELECT COUNT(bd)
        FROM BorrowingDetail bd
        WHERE bd.borrowing.id = :borrowingId
        AND bd.returnedAt IS NULL
        """)

    // đếm so bản sách mà Reader chưa trả trong 1 phiếu mượn
    long countUnreturnedBooksByBorrowingId(@Param("borrowingId") Long borrowingId);

    @Query("""
        SELECT COALESCE(SUM(bd.fine), 0)
        FROM BorrowingDetail bd
        WHERE bd.returnedAt IS NOT NULL
        AND FUNCTION('DATE', bd.returnedAt) = CURRENT_DATE
        """)

    long getTodayFineRevenue();

    @Query("""
        SELECT COALESCE(SUM(bd.fine), 0)
        FROM BorrowingDetail bd
        WHERE bd.returnedAt IS NOT NULL
        AND YEAR(bd.returnedAt) = YEAR(CURRENT_DATE)
        AND MONTH(bd.returnedAt) = MONTH(CURRENT_DATE)
        """)

    long getMonthlyFineRevenue();

    Optional<BorrowingDetail> findById(Long id);
}