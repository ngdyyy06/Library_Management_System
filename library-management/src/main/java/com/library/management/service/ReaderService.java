package com.library.management.service;

import com.library.management.dto.CreateReaderRequest;
import com.library.management.entity.Reader;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.ReaderRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service  // khi spring boot khởi động, spring sẽ tạo ra ReaderService
public class ReaderService {

    private final ReaderRepository readerRepository;

    public ReaderService(ReaderRepository readerRepository) {
        this.readerRepository = readerRepository;
    }

    // lấy tất cả dữ liệu database có về Reader
    public List<Reader> getAllReaders() {
        return readerRepository.findAll();
    }

    public Reader createReader(CreateReaderRequest request) {

        if (readerRepository.existsByReaderCode(request.getReaderCode())) {
            throw new RuntimeException("Reader code already exists!");
        }

        Reader reader = new Reader();

        reader.setReaderCode(request.getReaderCode());
        reader.setFullName(request.getFullName());
        reader.setEmail(request.getEmail());
        reader.setPhone(request.getPhone());
        reader.setAddress(request.getAddress());
        reader.setDateOfBirth(request.getDateOfBirth());
        reader.setStatus("ACTIVE");
        reader.setCreatedAt(LocalDateTime.now());

        return readerRepository.save(reader);
    }

    public Reader getReaderById(Long id) {
        return readerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Reader not found!"));
    }

    public Reader updateReader(Long id, CreateReaderRequest request) {

        Reader reader = readerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reader not found"));


        // kiểm tra trùng id
        if (readerRepository.existsByReaderCodeAndIdNot(
                request.getReaderCode(), id)) {

            throw new RuntimeException("Reader code already exists");
        }

        reader.setReaderCode(request.getReaderCode());
        reader.setFullName(request.getFullName());
        reader.setEmail(request.getEmail());
        reader.setPhone(request.getPhone());
        reader.setAddress(request.getAddress());
        reader.setDateOfBirth(request.getDateOfBirth());

        return readerRepository.save(reader);
    }

    // khoá tài khoản Reader
    public Reader deactivateReader(Long id) {

        Reader reader = readerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reader not found"));

        // Reader đã dừng hoạt động r thì k xoá
        if ("INACTIVE".equals(reader.getStatus())) {
            throw new RuntimeException("Reader is already inactive");
        }

        reader.setStatus("INACTIVE");

        return readerRepository.save(reader);
    }

    // kích hoạt lại Reader
    public Reader activateReader(Long id) {

        Reader reader = readerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reader not found"));

        if ("ACTIVE".equals(reader.getStatus())) {
            throw new RuntimeException("Reader is already active");
        }

        reader.setStatus("ACTIVE");

        return readerRepository.save(reader);
    }

    
}