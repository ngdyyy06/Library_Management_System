package com.library.management.repository;

import com.library.management.entity.ImportReceiptDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportReceiptDetailRepository
        extends JpaRepository<ImportReceiptDetail, Long> {

    List<ImportReceiptDetail> findByImportReceiptId(Long importReceiptId);

    boolean existsByImportReceiptIdAndBookId(
            Long importReceiptId,
            Long bookId
    );
}