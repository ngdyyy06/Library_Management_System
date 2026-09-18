package com.library.management.service;

import com.library.management.dto.CreateBorrowRequest;
import com.library.management.entity.Book;
import com.library.management.entity.BookCopy;
import com.library.management.entity.BorrowRequest;
import com.library.management.entity.Borrowing;
import com.library.management.entity.BorrowingDetail;
import com.library.management.entity.Reader;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.BookCopyRepository;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowRequestRepository;
import com.library.management.repository.BorrowingDetailRepository;
import com.library.management.repository.BorrowingRepository;
import com.library.management.repository.ReaderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BorrowRequestService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final ReaderRepository readerRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BorrowingRepository borrowingRepository;
    private final BorrowingDetailRepository borrowingDetailRepository;

    public BorrowRequestService(
            BorrowRequestRepository borrowRequestRepository,
            ReaderRepository readerRepository,
            BookRepository bookRepository,
            BookCopyRepository bookCopyRepository,
            BorrowingRepository borrowingRepository,
            BorrowingDetailRepository borrowingDetailRepository
    ) {
        this.borrowRequestRepository = borrowRequestRepository;
        this.readerRepository = readerRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.borrowingRepository = borrowingRepository;
        this.borrowingDetailRepository = borrowingDetailRepository;
    }

    public BorrowRequest createRequest(
            String username,
            CreateBorrowRequest request
    ) {

        Reader reader = readerRepository.findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reader not found for this user"
                        ));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Book not found"
                        ));

        if (!"ACTIVE".equals(reader.getStatus())) {
            throw new RuntimeException(
                    "Inactive reader cannot create borrowing request"
            );
        }

        if (!"ACTIVE".equals(book.getStatus())) {
            throw new RuntimeException(
                    "Inactive book cannot be requested"
            );
        }

        if (request.getQuantity() <= 0) {
            throw new RuntimeException(
                    "Quantity must be greater than 0"
            );
        }

        if (request.getQuantity() > book.getAvailableQuantity()) {
            throw new RuntimeException(
                    "Requested quantity exceeds available quantity"
            );
        }

        BorrowRequest borrowRequest = new BorrowRequest();

        borrowRequest.setReader(reader);
        borrowRequest.setBook(book);
        borrowRequest.setQuantity(request.getQuantity());
        borrowRequest.setStatus("PENDING");
        borrowRequest.setRequestedAt(LocalDateTime.now());

        return borrowRequestRepository.save(borrowRequest);
    }

    public List<BorrowRequest> getMyRequests(String username) {

        Reader reader = readerRepository.findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reader not found for this user"
                        ));

        return borrowRequestRepository.findByReaderId(reader.getId());
    }

    public BorrowRequest getMyRequestById(
            Long requestId,
            String username
    ) {

        Reader reader = readerRepository.findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reader not found for this user"
                        ));

        BorrowRequest borrowRequest =
                borrowRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow request not found"
                                ));

        if (!borrowRequest.getReader().getId().equals(reader.getId())) {
            throw new RuntimeException(
                    "You are not allowed to view this borrowing request"
            );
        }

        return borrowRequest;
    }

    public BorrowRequest cancelRequest(
            Long requestId,
            String username
    ) {

        Reader reader = readerRepository.findByUserUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Reader not found for this user"
                        ));

        BorrowRequest borrowRequest =
                borrowRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow request not found"
                                ));

        if (!borrowRequest.getReader().getId().equals(reader.getId())) {
            throw new RuntimeException(
                    "You are not allowed to cancel this borrowing request"
            );
        }

        if (!"PENDING".equals(borrowRequest.getStatus())) {
            throw new RuntimeException(
                    "Only pending borrowing requests can be cancelled"
            );
        }

        borrowRequest.setStatus("CANCELLED");

        return borrowRequestRepository.save(borrowRequest);
    }

    public List<BorrowRequest> getAllRequests() {

        return borrowRequestRepository.findAll();
    }

    @Transactional
    public BorrowRequest approveRequest(Long requestId) {

        // 1. Tìm borrowing request
        BorrowRequest borrowRequest =
                borrowRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow request not found"
                                ));

        // 2. Chỉ request PENDING mới được approve
        if (!"PENDING".equals(borrowRequest.getStatus())) {
            throw new RuntimeException(
                    "Only pending borrowing requests can be approved"
            );
        }

        Reader reader = borrowRequest.getReader();
        Book book = borrowRequest.getBook();

        // 3. Kiểm tra Reader
        if (!"ACTIVE".equals(reader.getStatus())) {
            throw new RuntimeException(
                    "Reader is not active"
            );
        }

        // 4. Kiểm tra Book
        if (!"ACTIVE".equals(book.getStatus())) {
            throw new RuntimeException(
                    "Book is not active"
            );
        }

        // 5. Kiểm tra Reader có phiếu quá hạn hay không
        List<Borrowing> borrowings =
                borrowingRepository.findByReaderId(reader.getId());

        for (Borrowing borrowing : borrowings) {

            if ("OVERDUE".equals(borrowing.getStatus())) {
                throw new RuntimeException(
                        "Reader has an overdue borrowing"
                );
            }
        }

        // 6. Kiểm tra Reader có vượt quá 5 sách đang mượn không
        long currentBorrowedBooks =
                borrowingDetailRepository.countUnreturnedBooksByReaderId(
                        reader.getId()
                );

        if (currentBorrowedBooks + borrowRequest.getQuantity() > 5) {
            throw new RuntimeException(
                    "Reader cannot borrow more than 5 books"
            );
        }

        // 7. Kiểm tra số lượng sách còn lại
        if (borrowRequest.getQuantity() > book.getAvailableQuantity()) {
            throw new RuntimeException(
                    "Not enough available books"
            );
        }

        // 8. Lấy các BookCopy đang AVAILABLE
        List<BookCopy> availableCopies =
                bookCopyRepository.findByBookIdAndStatusOrderByIdAsc(
                        book.getId(),
                        "AVAILABLE"
                );

        // 9. Đảm bảo đủ bản sách thực tế
        if (availableCopies.size() < borrowRequest.getQuantity()) {
            throw new RuntimeException(
                    "Not enough available book copies"
            );
        }

        // 10. Tạo phiếu mượn
        Borrowing borrowing = new Borrowing(
                null,
                reader,
                LocalDateTime.now(),
                LocalDate.now().plusDays(7),
                "BORROWING"
        );

        borrowing.setRenewalCount(0);

        borrowing = borrowingRepository.save(borrowing);

        // 11. Tạo BorrowingDetail cho từng bản sách
        for (int i = 0; i < borrowRequest.getQuantity(); i++) {

            BookCopy bookCopy = availableCopies.get(i);

            BorrowingDetail detail = new BorrowingDetail();

            detail.setBorrowing(borrowing);
            detail.setBookCopy(bookCopy);
            detail.setReturnedAt(null);
            detail.setFine(0);

            borrowingDetailRepository.save(detail);

            // Chuyển bản sách sang BORROWED
            bookCopy.setStatus("BORROWED");

            bookCopyRepository.save(bookCopy);
        }

        // 12. Giảm số lượng sách có thể mượn
        book.setAvailableQuantity(
                book.getAvailableQuantity()
                        - borrowRequest.getQuantity()
        );

        bookRepository.save(book);

        // 13. Đổi trạng thái request
        borrowRequest.setStatus("APPROVED");

        return borrowRequestRepository.save(borrowRequest);
    }

    @Transactional
    public BorrowRequest rejectRequest(Long requestId) {

        BorrowRequest borrowRequest =
                borrowRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Borrow request not found"
                                ));

        if (!"PENDING".equals(borrowRequest.getStatus())) {
            throw new RuntimeException(
                    "Only pending borrowing requests can be rejected"
            );
        }

        borrowRequest.setStatus("REJECTED");

        return borrowRequestRepository.save(borrowRequest);
    }

    public BorrowRequest getRequestById(Long id) {

        return borrowRequestRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Borrow request not found"
                        )
                );
    }
}