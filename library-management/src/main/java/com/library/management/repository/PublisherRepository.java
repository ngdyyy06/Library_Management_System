package com.library.management.repository;

import com.library.management.entity.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PublisherRepository extends JpaRepository<Publisher, Long> {

    boolean existsByName(String name);

    boolean existsByEmail(String email);
}