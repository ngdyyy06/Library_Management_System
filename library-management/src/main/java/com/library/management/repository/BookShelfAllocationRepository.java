package com.library.management.repository;

import com.library.management.entity.BookShelfAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookShelfAllocationRepository
        extends JpaRepository<BookShelfAllocation, Long> {

    List<BookShelfAllocation> findByShelfId(Long shelfId);

    List<BookShelfAllocation> findByBookId(Long bookId);

    Optional<BookShelfAllocation> findByBookIdAndShelfId(
            Long bookId,
            Long shelfId
    );

    @Query("""
            SELECT COALESCE(SUM(a.quantity), 0)
            FROM BookShelfAllocation a
            WHERE a.shelf.id = :shelfId
            """)
    Integer getTotalQuantityByShelfId(
            @Param("shelfId") Long shelfId
    );

    void deleteByBookIdAndShelfId(
            Long bookId,
            Long shelfId
    );
}