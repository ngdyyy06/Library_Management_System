package com.library.management.service;

import com.library.management.dto.CreateReaderRequest;
import com.library.management.entity.LibraryCard;
import com.library.management.entity.LibraryCardPayment;
import com.library.management.entity.Reader;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.LibraryCardPaymentRepository;
import com.library.management.repository.LibraryCardRepository;
import com.library.management.repository.ReaderRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReaderService {

    private static final BigDecimal CARD_FEE = new BigDecimal("50000");

    private final ReaderRepository readerRepository;
    private final LibraryCardRepository libraryCardRepository;
    private final LibraryCardPaymentRepository libraryCardPaymentRepository;

    public ReaderService(
            ReaderRepository readerRepository,
            LibraryCardRepository libraryCardRepository,
            LibraryCardPaymentRepository libraryCardPaymentRepository
    ) {
        this.readerRepository = readerRepository;
        this.libraryCardRepository = libraryCardRepository;
        this.libraryCardPaymentRepository = libraryCardPaymentRepository;
    }

    // Lấy tất cả Reader
    public List<Reader> getAllReaders() {
        return readerRepository.findAll();
    }

    // Tạo Reader mới + cấp Library Card + thu Card Fee
    @Transactional
    public Reader createReader(CreateReaderRequest request) {

        String readerCode = request.getReaderCode() != null
                ? request.getReaderCode().trim()
                : null;

        String email = request.getEmail() != null
                ? request.getEmail().trim()
                : null;

        String phone = request.getPhone() != null
                ? request.getPhone().trim()
                : null;

        if (readerRepository.existsByReaderCode(readerCode)) {
            throw new RuntimeException("Reader code already exists!");
        }

        if (email != null && !email.isBlank()
                && readerRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists!");
        }

        if (phone != null && !phone.isBlank()
                && readerRepository.existsByPhone(phone)) {
            throw new RuntimeException("Phone number already exists!");
        }

        Reader reader = new Reader();

        reader.setReaderCode(readerCode);
        reader.setFullName(request.getFullName());
        reader.setEmail(email);
        reader.setPhone(phone);
        reader.setAddress(request.getAddress());
        reader.setDateOfBirth(request.getDateOfBirth());
        reader.setStatus("ACTIVE");
        reader.setCreatedAt(LocalDateTime.now());

        Reader savedReader = readerRepository.save(reader);

        String cardNumber = generateCardNumber();

        LibraryCard card = new LibraryCard();
        card.setCardNumber(cardNumber);
        card.setReader(savedReader);
        card.setIssuedAt(LocalDate.now());
        card.setExpiredAt(LocalDate.now().plusYears(1));
        card.setStatus(LibraryCard.CardStatus.ACTIVE);

        LibraryCard savedCard = libraryCardRepository.save(card);

        LibraryCardPayment payment = new LibraryCardPayment();
        payment.setLibraryCard(savedCard);
        payment.setAmount(CARD_FEE);
        payment.setPaidAt(LocalDateTime.now());

        libraryCardPaymentRepository.save(payment);

        return savedReader;
    }

    // Lấy Reader theo ID
    public Reader getReaderById(Long id) {
        return readerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Reader not found!"));
    }

    // Cập nhật thông tin Reader
    public Reader updateReader(Long id, CreateReaderRequest request) {

        Reader reader = readerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Reader not found"));

        // Kiểm tra ReaderCode trùng với Reader khác
        if (readerRepository.existsByReaderCodeAndIdNot(
                request.getReaderCode(), id)) {

            throw new RuntimeException("Reader code already exists");
        }

        if (readerRepository.existsByEmailAndIdNot(
                request.getEmail(), id)) {

            throw new RuntimeException("Email already exists");
        }

        if (readerRepository.existsByPhoneAndIdNot(
                request.getPhone(), id)) {

            throw new RuntimeException("Phone number already exists");
        }

        reader.setReaderCode(request.getReaderCode());
        reader.setFullName(request.getFullName());
        reader.setEmail(request.getEmail());
        reader.setPhone(request.getPhone());
        reader.setAddress(request.getAddress());
        reader.setDateOfBirth(request.getDateOfBirth());

        return readerRepository.save(reader);
    }

    // Khóa thẻ thành viên
    public Reader deactivateReader(Long id) {

        Reader reader = readerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Reader not found"));

        if ("INACTIVE".equals(reader.getStatus())) {
            throw new RuntimeException("Reader is already inactive");
        }

        reader.setStatus("INACTIVE");

        libraryCardRepository.findByReaderId(id)
                .ifPresent(card -> {
                    card.setStatus(LibraryCard.CardStatus.INACTIVE);
                    libraryCardRepository.save(card);
                });

        return readerRepository.save(reader);
    }

    // Kích hoạt lại thẻ thành viên
    public Reader activateReader(Long id) {

        Reader reader = readerRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Reader not found"));

        if ("ACTIVE".equals(reader.getStatus())) {
            throw new RuntimeException("Reader is already active");
        }

        reader.setStatus("ACTIVE");

        libraryCardRepository.findByReaderId(id)
                .ifPresent(card -> {
                    card.setStatus(LibraryCard.CardStatus.ACTIVE);
                    libraryCardRepository.save(card);
                });

        return readerRepository.save(reader);
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