package com.library.management.service;

import com.library.management.dto.DashboardResponse;
import com.library.management.repository.AuthorRepository;
import com.library.management.repository.BookCopyRepository;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BorrowingDetailRepository;
import com.library.management.repository.ReaderRepository;
import com.library.management.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final ReaderRepository readerRepository;
    private final AuthorRepository authorRepository;
    private final UserRepository userRepository;
    private final BorrowingDetailRepository borrowingDetailRepository;

    public DashboardService(
            BookRepository bookRepository,
            BookCopyRepository bookCopyRepository,
            ReaderRepository readerRepository,
            AuthorRepository authorRepository,
            UserRepository userRepository,
            BorrowingDetailRepository borrowingDetailRepository
    ) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.readerRepository = readerRepository;
        this.authorRepository = authorRepository;
        this.userRepository = userRepository;
        this.borrowingDetailRepository = borrowingDetailRepository;
    }

    public DashboardResponse getDashboard() {

        long totalBooks = bookRepository.count();

        long totalBookCopies = bookCopyRepository.count();

        long totalReaders = readerRepository.count();

        long totalAuthors = authorRepository.count();

        long totalUsers = userRepository.count();

        long activeUsers = userRepository.findAll()
                .stream()
                .filter(user -> "ACTIVE".equals(user.getStatus()))
                .count();

        long inactiveUsers = userRepository.findAll()
                .stream()
                .filter(user -> !"ACTIVE".equals(user.getStatus()))
                .count();

        long todayFineRevenue =
                borrowingDetailRepository.getTodayFineRevenue();

        long monthlyFineRevenue =
                borrowingDetailRepository.getMonthlyFineRevenue();

        return new DashboardResponse(
                totalBooks,
                totalBookCopies,
                totalReaders,
                totalAuthors,
                totalUsers,
                activeUsers,
                inactiveUsers,
                todayFineRevenue,
                monthlyFineRevenue
        );
    }
}