package com.library.management.service;

import com.library.management.entity.LibraryCard;
import com.library.management.entity.LibraryCardPayment;
import com.library.management.entity.Reader;
import com.library.management.repository.LibraryCardPaymentRepository;
import com.library.management.repository.LibraryCardRepository;
import com.library.management.repository.ReaderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class LibraryCardService {

    private static final BigDecimal CARD_FEE = new BigDecimal("50000");

    private final LibraryCardRepository libraryCardRepository;
    private final LibraryCardPaymentRepository libraryCardPaymentRepository;
    private final ReaderRepository readerRepository;

    public LibraryCardService(
            LibraryCardRepository libraryCardRepository,
            LibraryCardPaymentRepository libraryCardPaymentRepository,
            ReaderRepository readerRepository
    ) {
        this.libraryCardRepository = libraryCardRepository;
        this.libraryCardPaymentRepository = libraryCardPaymentRepository;
        this.readerRepository = readerRepository;
    }

    @Transactional
    public LibraryCard createCard(Long readerId) {

        Reader reader = readerRepository.findById(readerId)
                .orElseThrow(() -> new RuntimeException("Reader not found."));

        if (libraryCardRepository.existsByReaderId(readerId)) {
            throw new RuntimeException("Reader already has a library card.");
        }

        String cardNumber = generateCardNumber();

        LibraryCard card = new LibraryCard();
        card.setCardNumber(cardNumber);
        card.setReader(reader);
        card.setIssuedAt(LocalDate.now());
        card.setExpiredAt(LocalDate.now().plusYears(1));
        card.setStatus(LibraryCard.CardStatus.ACTIVE);

        LibraryCard savedCard = libraryCardRepository.save(card);

        LibraryCardPayment payment = new LibraryCardPayment();
        payment.setLibraryCard(savedCard);
        payment.setAmount(CARD_FEE);
        payment.setPaidAt(LocalDateTime.now());

        libraryCardPaymentRepository.save(payment);

        return savedCard;
    }

    public LibraryCard getByCardNumber(String cardNumber) {
        return libraryCardRepository.findByCardNumber(cardNumber)
                .orElseThrow(() -> new RuntimeException("Library card not found."));
    }

    public LibraryCard getByReaderId(Long readerId) {
        return libraryCardRepository.findByReaderId(readerId)
                .orElseThrow(() -> new RuntimeException("Library card not found."));
    }

    private String generateCardNumber() {

        long nextId = libraryCardRepository.count() + 1;

        String cardNumber;

        do {
            cardNumber = String.format("CARD-%06d", nextId++);
        } while (libraryCardRepository.existsByCardNumber(cardNumber));

        return cardNumber;
    }
}