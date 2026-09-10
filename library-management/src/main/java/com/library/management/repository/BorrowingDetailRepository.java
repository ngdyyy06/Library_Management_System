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

    // đếm số bản sách mà Reader đang giữ và chua trả
    long countUnreturnedBooksByReaderId(@Param("readerId") Long readerId);

    Optional<BorrowingDetail> findById(Long id);
}