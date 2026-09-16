package com.library.management.controller;

import com.library.management.entity.Book;
import com.library.management.entity.Category;
import com.library.management.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Tạo Category
    @PostMapping
    public Category createCategory(
            @RequestParam String name) {

        return categoryService.createCategory(name);
    }

    // Lấy tất cả Category
    @GetMapping
    public List<Category> getAllCategories() {

        return categoryService.getAllCategories();
    }

    // Lấy Category theo ID
    @GetMapping("/{id}")
    public Category getCategoryById(
            @PathVariable Long id) {

        return categoryService.getCategoryById(id);
    }

    @GetMapping("/{id}/books")
    public List<Book> getBooksByCategory(@PathVariable Long id) {
        return categoryService.getBooksByCategory(id);
    }

    // Cập nhật Category
    @PutMapping("/{id}")
    public Category updateCategory(
            @PathVariable Long id,
            @RequestParam String name) {

        return categoryService.updateCategory(id, name);
    }

    // Vô hiệu hóa Category
    @PatchMapping("/{id}/deactivate")
    public Category deactivateCategory(
            @PathVariable Long id) {

        return categoryService.deactivateCategory(id);
    }

    // Kích hoạt Category
    @PatchMapping("/{id}/activate")
    public Category activateCategory(
            @PathVariable Long id) {

        return categoryService.activateCategory(id);
    }
}