package com.library.management.repository;

import com.library.management.entity.Reader;
import org.springframework.data.jpa.repository.JpaRepository;

// ReaderRepository dùng để thao tác với entity Reader.
public interface ReaderRepository extends JpaRepository<Reader, Long> {

    boolean existsByReaderCode(String readerCode);

    boolean existsByReaderCodeAndIdNot(String readerCode, Long id);
}