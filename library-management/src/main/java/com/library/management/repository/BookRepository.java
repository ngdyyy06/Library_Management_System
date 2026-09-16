package com.library.management.repository;

import com.library.management.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbn(String isbn);

    List<Book> findByAuthorsId(Long authorId);

    @Query("""
        SELECT b
        FROM Book b
        JOIN b.authors a
        WHERE a.id = :authorId
        """)
    List<Book> findBooksByAuthorId(@Param("authorId") Long authorId);

    List<Book> findByCategoriesId(Long categoryId);
}