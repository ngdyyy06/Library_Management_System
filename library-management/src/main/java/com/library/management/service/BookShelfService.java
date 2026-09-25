package com.library.management.service;

import com.library.management.entity.BookShelf;
import com.library.management.repository.BookShelfRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookShelfService {

    private final BookShelfRepository bookShelfRepository;

    public BookShelfService(BookShelfRepository bookShelfRepository) {
        this.bookShelfRepository = bookShelfRepository;
    }

    public List<BookShelf> getAllShelves() {
        return bookShelfRepository.findAll();
    }

    public BookShelf createShelf(BookShelf shelf) {

        if (shelf.getShelfCode() == null
                || shelf.getShelfCode().trim().isEmpty()) {
            throw new RuntimeException("Shelf code cannot be empty");
        }

        if (shelf.getName() == null
                || shelf.getName().trim().isEmpty()) {
            throw new RuntimeException("Shelf name cannot be empty");
        }

        String shelfCode = shelf.getShelfCode().trim();
        String name = shelf.getName().trim();

        if (bookShelfRepository.existsByShelfCode(shelfCode)) {
            throw new RuntimeException("Shelf code already exists");
        }

        shelf.setShelfCode(shelfCode);
        shelf.setName(name);

        if (shelf.getStatus() == null
                || shelf.getStatus().trim().isEmpty()) {
            shelf.setStatus("ACTIVE");
        }

        return bookShelfRepository.save(shelf);
    }

    public BookShelf getShelfById(Long id) {

        return bookShelfRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Shelf not found"));
    }

    public BookShelf updateShelf(Long id, BookShelf request) {

        BookShelf shelf = bookShelfRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Shelf not found"));

        if (request.getShelfCode() == null
                || request.getShelfCode().trim().isEmpty()) {
            throw new RuntimeException("Shelf code cannot be empty");
        }

        if (request.getName() == null
                || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Shelf name cannot be empty");
        }

        String shelfCode = request.getShelfCode().trim();
        String name = request.getName().trim();

        if (!shelf.getShelfCode().equalsIgnoreCase(shelfCode)
                && bookShelfRepository.existsByShelfCode(shelfCode)) {
            throw new RuntimeException("Shelf code already exists");
        }

        shelf.setShelfCode(shelfCode);
        shelf.setName(name);

        return bookShelfRepository.save(shelf);
    }

    public BookShelf deactivateShelf(Long id) {

        BookShelf shelf = bookShelfRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Shelf not found"));

        if ("INACTIVE".equals(shelf.getStatus())) {
            throw new RuntimeException("Shelf is already inactive");
        }

        shelf.setStatus("INACTIVE");

        return bookShelfRepository.save(shelf);
    }

    public BookShelf activateShelf(Long id) {

        BookShelf shelf = bookShelfRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Shelf not found"));

        if ("ACTIVE".equals(shelf.getStatus())) {
            throw new RuntimeException("Shelf is already active");
        }

        shelf.setStatus("ACTIVE");

        return bookShelfRepository.save(shelf);
    }
}