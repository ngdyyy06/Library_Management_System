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

    Optional<BorrowingDetail> findById(Long id);
}