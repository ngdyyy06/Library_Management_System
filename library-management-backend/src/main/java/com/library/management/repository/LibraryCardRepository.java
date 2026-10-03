package com.library.management.repository;

import com.library.management.entity.LibraryCard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LibraryCardRepository extends JpaRepository<LibraryCard, Long> {

    Optional<LibraryCard> findByCardNumber(String cardNumber);

    Optional<LibraryCard> findByReaderId(Long readerId);

    boolean existsByCardNumber(String cardNumber);

    boolean existsByReaderId(Long readerId);
}