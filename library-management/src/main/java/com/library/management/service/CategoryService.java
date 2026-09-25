package com.library.management.service;

import com.library.management.entity.Book;
import com.library.management.entity.BookShelf;
import com.library.management.entity.Category;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.BookRepository;
import com.library.management.repository.BookShelfRepository;
import com.library.management.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final BookShelfRepository bookShelfRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            BookRepository bookRepository,
            BookShelfRepository bookShelfRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
        this.bookShelfRepository = bookShelfRepository;
    }

    // Tạo Category
    public Category createCategory(String name) {

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Category name cannot be empty");
        }

        String categoryName = name.trim();

        if (categoryRepository.existsByNameIgnoreCase(categoryName)) {
            throw new RuntimeException("Category already exists");
        }

        Category category = new Category();

        category.setName(categoryName);
        category.setStatus("ACTIVE");

        return categoryRepository.save(category);
    }

    // Lấy tất cả Category
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Lấy Category theo ID
    public Category getCategoryById(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));
    }

    // Cập nhật Category
    public Category updateCategory(Long id, String name) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Category name cannot be empty");
        }

        String categoryName = name.trim();

        if (!category.getName().equalsIgnoreCase(categoryName)
                && categoryRepository.existsByNameIgnoreCase(categoryName)) {

            throw new RuntimeException("Category already exists");
        }

        category.setName(categoryName);

        return categoryRepository.save(category);
    }

    // Vô hiệu hóa Category
    public Category deactivateCategory(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        if ("INACTIVE".equals(category.getStatus())) {
            throw new RuntimeException("Category is already inactive");
        }

        category.setStatus("INACTIVE");

        return categoryRepository.save(category);
    }

    // Kích hoạt Category
    public Category activateCategory(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        if ("ACTIVE".equals(category.getStatus())) {
            throw new RuntimeException("Category is already active");
        }

        category.setStatus("ACTIVE");

        return categoryRepository.save(category);
    }

    // Lấy Books theo Category
    public List<Book> getBooksByCategory(Long categoryId) {

        categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        return bookRepository.findByCategoriesId(categoryId);
    }

    // Gán Default Shelf cho Category
    public Category assignDefaultShelf(Long categoryId, Long shelfId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        BookShelf shelf = bookShelfRepository.findById(shelfId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Shelf not found"));

        category.setDefaultShelf(shelf);

        return categoryRepository.save(category);
    }

    public Category removeDefaultShelf(Long categoryId) {

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        if (category.getDefaultShelf() == null) {
            throw new RuntimeException(
                    "Category does not have a default shelf"
            );
        }

        category.setDefaultShelf(null);

        return categoryRepository.save(category);
    }
}