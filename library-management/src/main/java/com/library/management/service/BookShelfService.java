package com.library.management.service;

import com.library.management.dto.BookShelfDetailResponse;
import com.library.management.dto.BookShelfListResponse;
import com.library.management.entity.Book;
import com.library.management.entity.BookShelf;
import com.library.management.entity.BookShelfAllocation;
import com.library.management.entity.Category;
import com.library.management.repository.BookShelfAllocationRepository;
import com.library.management.repository.BookShelfRepository;
import com.library.management.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookShelfService {

    private static final int MAX_CAPACITY = 50;

    private final BookShelfRepository bookShelfRepository;
    private final BookShelfAllocationRepository allocationRepository;
    private final CategoryRepository categoryRepository;

    public BookShelfService(
            BookShelfRepository bookShelfRepository,
            BookShelfAllocationRepository allocationRepository,
            CategoryRepository categoryRepository
    ) {
        this.bookShelfRepository = bookShelfRepository;
        this.allocationRepository = allocationRepository;
        this.categoryRepository = categoryRepository;
    }

    // =========================================================
    // GET ALL SHELVES
    // =========================================================

    public List<BookShelfListResponse> getAllShelves() {

        return bookShelfRepository.findAll()
                .stream()
                .map(shelf -> {

                    int usedCapacity =
                            getUsedCapacity(shelf.getId());

                    return new BookShelfListResponse(
                            shelf.getId(),
                            shelf.getShelfCode(),
                            shelf.getName(),
                            shelf.getStatus(),
                            usedCapacity,
                            MAX_CAPACITY,
                            MAX_CAPACITY - usedCapacity
                    );
                })
                .toList();
    }

    // =========================================================
    // CREATE SHELF
    // =========================================================

    @Transactional
    public BookShelf createShelf(BookShelf shelf) {

        if (shelf.getShelfCode() == null
                || shelf.getShelfCode().trim().isEmpty()) {

            throw new RuntimeException(
                    "Shelf code cannot be empty"
            );
        }

        if (shelf.getName() == null
                || shelf.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Shelf name cannot be empty"
            );
        }

        String shelfCode =
                shelf.getShelfCode().trim();

        String name =
                shelf.getName().trim();

        if (bookShelfRepository.existsByShelfCode(shelfCode)) {

            throw new RuntimeException(
                    "Shelf code already exists"
            );
        }

        shelf.setShelfCode(shelfCode);
        shelf.setName(name);

        if (shelf.getStatus() == null
                || shelf.getStatus().trim().isEmpty()) {

            shelf.setStatus("ACTIVE");
        }

        // =====================================================
        // Resolve Categories
        // =====================================================

        if (shelf.getCategories() != null) {

            List<Category> categories =
                    shelf.getCategories()
                            .stream()
                            .map(category ->
                                    categoryRepository.findById(
                                                    category.getId()
                                            )
                                            .orElseThrow(() ->
                                                    new RuntimeException(
                                                            "Category not found: "
                                                                    + category.getId()
                                                    )
                                            )
                            )
                            .toList();

            shelf.setCategories(categories);

            /*
             * IMPORTANT:
             *
             * A category can belong to multiple shelves.
             *
             * Example:
             *
             * Computer Science
             *      ├── Programming Shelf
             *      └── Backup Shelf
             *
             * We only set the default shelf if the category
             * does not have one yet.
             *
             * We DO NOT overwrite an existing default shelf.
             */

            for (Category category : categories) {

                if (category.getDefaultShelf() == null) {

                    category.setDefaultShelf(shelf);

                    categoryRepository.save(category);
                }
            }
        }

        return bookShelfRepository.save(shelf);
    }

    // =========================================================
    // GET SHELF BY ID
    // =========================================================

    public BookShelf getShelfById(Long id) {

        return bookShelfRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Shelf not found"
                        )
                );
    }

    // =========================================================
    // GET USED CAPACITY
    // =========================================================

    public int getUsedCapacity(Long shelfId) {

        Integer quantity =
                allocationRepository
                        .getTotalQuantityByShelfId(shelfId);

        return quantity != null
                ? quantity
                : 0;
    }

    // =========================================================
    // GET AVAILABLE CAPACITY
    // =========================================================

    public int getAvailableCapacity(Long shelfId) {

        return MAX_CAPACITY
                - getUsedCapacity(shelfId);
    }

    // =========================================================
    // GET ALLOCATED QUANTITY OF BOOK
    // =========================================================

    public int getAllocatedQuantity(Long bookId) {

        List<BookShelfAllocation> allocations =
                allocationRepository.findByBookId(bookId);

        return allocations.stream()
                .mapToInt(BookShelfAllocation::getQuantity)
                .sum();
    }

    // =========================================================
    // GET MAX CAPACITY
    // =========================================================

    public int getMaxCapacity() {

        return MAX_CAPACITY;
    }

    // =========================================================
    // ALLOCATE BOOK
    // =========================================================

    @Transactional
    public void allocateBook(
            Book book,
            int quantity
    ) {

        if (quantity <= 0) {
            return;
        }

        Category category =
                book.getPrimaryCategory();

        if (category == null) {

            throw new RuntimeException(
                    "Book does not have a primary category"
            );
        }

        // =====================================================
        // Find all active shelves containing this category
        // =====================================================

        List<BookShelf> shelves =
                bookShelfRepository
                        .findByCategoriesIdAndStatus(
                                category.getId(),
                                "ACTIVE"
                        );

        // =====================================================
        // Default shelf gets priority
        // =====================================================

        BookShelf defaultShelf =
                category.getDefaultShelf();

        shelves.sort(
                Comparator
                        .comparing(
                                (BookShelf shelf) ->
                                        defaultShelf != null
                                                && shelf.getId().equals(
                                                defaultShelf.getId()
                                        )
                        )
                        .reversed()
                        .thenComparing(
                                BookShelf::getId
                        )
        );

        int remaining = quantity;

        // =====================================================
        // Allocate to shelves
        // =====================================================

        for (BookShelf shelf : shelves) {

            if (remaining <= 0) {
                break;
            }

            int usedCapacity =
                    getUsedCapacity(shelf.getId());

            int availableCapacity =
                    MAX_CAPACITY - usedCapacity;

            if (availableCapacity <= 0) {
                continue;
            }

            int allocationQuantity =
                    Math.min(
                            remaining,
                            availableCapacity
                    );

            BookShelfAllocation allocation =
                    allocationRepository
                            .findByBookIdAndShelfId(
                                    book.getId(),
                                    shelf.getId()
                            )
                            .orElse(null);

            if (allocation == null) {

                allocation =
                        new BookShelfAllocation();

                allocation.setBook(book);
                allocation.setShelf(shelf);
                allocation.setQuantity(
                        allocationQuantity
                );

            } else {

                allocation.setQuantity(
                        allocation.getQuantity()
                                + allocationQuantity
                );
            }

            allocationRepository.save(
                    allocation
            );

            remaining -= allocationQuantity;
        }

        // =====================================================
        // Not enough capacity
        // =====================================================

        if (remaining > 0) {

            throw new RuntimeException(
                    "Not enough shelf capacity for category: "
                            + category.getName()
                            + ". Remaining quantity: "
                            + remaining
            );
        }
    }

    // =========================================================
    // REMOVE BOOK QUANTITY
    // =========================================================

    @Transactional
    public void removeBookQuantity(
            Book book,
            int quantity
    ) {

        if (quantity <= 0) {
            return;
        }

        List<BookShelfAllocation> allocations =
                allocationRepository
                        .findByBookId(book.getId());

        int remaining = quantity;

        for (BookShelfAllocation allocation :
                allocations) {

            if (remaining <= 0) {
                break;
            }

            int currentQuantity =
                    allocation.getQuantity();

            int removeQuantity =
                    Math.min(
                            currentQuantity,
                            remaining
                    );

            int newQuantity =
                    currentQuantity
                            - removeQuantity;

            if (newQuantity == 0) {

                allocationRepository.delete(
                        allocation
                );

            } else {

                allocation.setQuantity(
                        newQuantity
                );

                allocationRepository.save(
                        allocation
                );
            }

            remaining -= removeQuantity;
        }

        if (remaining > 0) {

            throw new RuntimeException(
                    "Not enough allocated quantity to remove for book: "
                            + book.getTitle()
            );
        }
    }

    // =========================================================
    // UPDATE SHELF
    // =========================================================

    @Transactional
    public BookShelf updateShelf(
            Long id,
            BookShelf request
    ) {

        BookShelf shelf =
                bookShelfRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Book shelf not found"
                                )
                        );

        if (request.getShelfCode() == null
                || request.getShelfCode()
                .trim()
                .isEmpty()) {

            throw new RuntimeException(
                    "Shelf code is required"
            );
        }

        if (request.getName() == null
                || request.getName()
                .trim()
                .isEmpty()) {

            throw new RuntimeException(
                    "Shelf name is required"
            );
        }

        String newShelfCode =
                request.getShelfCode().trim();

        String newName =
                request.getName().trim();

        // =====================================================
        // Check duplicate shelf code
        // =====================================================

        Optional<BookShelf> existingShelf =
                bookShelfRepository.findByShelfCode(
                        newShelfCode
                );

        if (existingShelf.isPresent()
                && !existingShelf.get()
                .getId()
                .equals(id)) {

            throw new RuntimeException(
                    "Shelf code already exists"
            );
        }

        shelf.setShelfCode(
                newShelfCode
        );

        shelf.setName(
                newName
        );

        // =====================================================
        // Update Categories
        // =====================================================

        if (request.getCategories() != null) {

            List<Long> categoryIds =
                    request.getCategories()
                            .stream()
                            .map(Category::getId)
                            .toList();

            List<Category> categories =
                    categoryRepository.findAllById(
                            categoryIds
                    );

            if (categories.size()
                    != categoryIds.size()) {

                throw new RuntimeException(
                        "One or more categories not found"
                );
            }

            shelf.setCategories(
                    categories
            );

            /*
             * IMPORTANT:
             *
             * Adding a category to another shelf
             * MUST NOT change its existing default shelf.
             *
             * Only assign this shelf as default when
             * the category does not have a default shelf.
             */

            for (Category category :
                    categories) {

                if (category.getDefaultShelf()
                        == null) {

                    category.setDefaultShelf(
                            shelf
                    );

                    categoryRepository.save(
                            category
                    );
                }
            }
        }

        return bookShelfRepository.save(
                shelf
        );
    }

    // =========================================================
    // DEACTIVATE SHELF
    // =========================================================

    public BookShelf deactivateShelf(Long id) {

        BookShelf shelf =
                bookShelfRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Shelf not found"
                                )
                        );

        if ("INACTIVE".equals(
                shelf.getStatus())) {

            throw new RuntimeException(
                    "Shelf is already inactive"
            );
        }

        shelf.setStatus("INACTIVE");

        return bookShelfRepository.save(
                shelf
        );
    }

    // =========================================================
    // ACTIVATE SHELF
    // =========================================================

    public BookShelf activateShelf(Long id) {

        BookShelf shelf =
                bookShelfRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Shelf not found"
                                )
                        );

        if ("ACTIVE".equals(
                shelf.getStatus())) {

            throw new RuntimeException(
                    "Shelf is already active"
            );
        }

        shelf.setStatus("ACTIVE");

        return bookShelfRepository.save(
                shelf
        );
    }

    // =========================================================
    // GET SHELF DETAIL
    // =========================================================

    public BookShelfDetailResponse getShelfDetail(
            Long id
    ) {

        BookShelf shelf =
                bookShelfRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Shelf not found"
                                )
                        );

        int usedCapacity =
                getUsedCapacity(id);

        List<BookShelfAllocation> allocations =
                allocationRepository
                        .findByShelfId(id);

        List<BookShelfDetailResponse.BookAllocationResponse>
                books =
                allocations.stream()
                        .map(allocation ->
                                new BookShelfDetailResponse
                                        .BookAllocationResponse(
                                        allocation
                                                .getBook()
                                                .getId(),

                                        allocation
                                                .getBook()
                                                .getTitle(),

                                        allocation
                                                .getBook()
                                                .getIsbn(),

                                        allocation
                                                .getQuantity()
                                )
                        )
                        .collect(
                                Collectors.toList()
                        );

        return new BookShelfDetailResponse(
                shelf.getId(),
                shelf.getShelfCode(),
                shelf.getName(),
                shelf.getStatus(),
                usedCapacity,
                MAX_CAPACITY,
                MAX_CAPACITY - usedCapacity,
                books
        );
    }
}