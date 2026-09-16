package com.library.management.service;

import com.library.management.entity.Book;
import com.library.management.entity.Category;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.BookRepository;
import com.library.management.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;

    public CategoryService(CategoryRepository categoryRepository, BookRepository bookRepository) {
        this.categoryRepository = categoryRepository;
        this.bookRepository = bookRepository;
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

    public List<Book> getBooksByCategory(Long categoryId) {

        categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found"));

        return bookRepository.findByCategoriesId(categoryId);
    }
}