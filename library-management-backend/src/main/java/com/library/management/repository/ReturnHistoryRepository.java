package com.library.management.repository;

import com.library.management.entity.ReturnHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReturnHistoryRepository
        extends JpaRepository<ReturnHistory, Long> {

    List<ReturnHistory> findAllByOrderByReturnedAtDesc();
}