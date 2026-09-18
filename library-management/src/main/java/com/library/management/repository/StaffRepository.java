package com.library.management.repository;

import com.library.management.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByUserUsername(String username);

    Optional<Staff> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}