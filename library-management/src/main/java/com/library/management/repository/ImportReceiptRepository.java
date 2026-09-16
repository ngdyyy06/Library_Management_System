package com.library.management.repository;

import com.library.management.entity.ImportReceipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImportReceiptRepository
        extends JpaRepository<ImportReceipt, Long> {

    boolean existsByReceiptCode(String receiptCode);

    Optional<ImportReceipt> findByReceiptCode(String receiptCode);
}