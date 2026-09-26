package com.library.management.repository;

import com.library.management.entity.Reader;
import org.springframework.data.jpa.repository.JpaRepository;

// ReaderRepository dùng để thao tác với entity Reader.
public interface ReaderRepository extends JpaRepository<Reader, Long> {

    // Kiểm tra readerCode đã tồn tại khi thêm Reader
    boolean existsByReaderCode(String readerCode);

    // Kiểm tra readerCode đã tồn tại ở Reader khác khi sửa
    boolean existsByReaderCodeAndIdNot(String readerCode, Long id);

    // Kiểm tra phone đã tồn tại khi thêm Reader
    boolean existsByPhone(String phone);

    // Kiểm tra phone đã tồn tại ở Reader khác khi sửa
    boolean existsByPhoneAndIdNot(String phone, Long id);

    // Kiểm tra email đã tồn tại khi thêm Reader
    boolean existsByEmail(String email);

    // Kiểm tra email đã tồn tại ở Reader khác khi sửa
    boolean existsByEmailAndIdNot(String email, Long id);
}