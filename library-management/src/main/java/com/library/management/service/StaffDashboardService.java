package com.library.management.service;

import com.library.management.dto.StaffDashboardResponse;
import com.library.management.repository.*;
import org.springframework.stereotype.Service;
import com.library.management.repository.BookCopyRepository;

@Service
public class StaffDashboardService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final ReaderRepository readerRepository;
    private final BorrowingRepository borrowingRepository;
    private final BorrowingDetailRepository borrowingDetailRepository;

    public StaffDashboardService(
            BookRepository bookRepository,
            BookCopyRepository bookCopyRepository,
            ReaderRepository readerRepository,
            BorrowingRepository borrowingRepository,
            BorrowingDetailRepository borrowingDetailRepository) {

        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.readerRepository = readerRepository;
        this.borrowingRepository = borrowingRepository;
        this.borrowingDetailRepository = borrowingDetailRepository;

    }

    public StaffDashboardResponse getDashboard() {

        long totalBooks =
                bookRepository.count();

        long totalBookCopies = bookCopyRepository.count();

        long totalReaders =
                readerRepository.count();

        long totalBorrowings =
                borrowingRepository.count();

        long totalReturns =
                borrowingDetailRepository.countByReturnedAtIsNotNull();

        return new StaffDashboardResponse(
                totalBooks,
                totalBookCopies,
                totalReaders,
                totalBorrowings,
                totalReturns
        );
    }
}