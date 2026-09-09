package com.library.management.repository;

import com.library.management.entity.Reader;
import org.springframework.data.jpa.repository.JpaRepository;


// ReaderRepository là repository dùng để thao tác với entity Reader,
// và Long là kiểu dữ liệu của khóa chính.
public interface ReaderRepository extends JpaRepository<Reader, Long> {
    boolean existsByReaderCode(String readerCode);

    boolean existsByReaderCodeAndIdNot(String readerCode, Long id);
}