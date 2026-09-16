package com.library.management.service;

import com.library.management.entity.Publisher;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.PublisherRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PublisherService {

    private final PublisherRepository publisherRepository;

    public PublisherService(PublisherRepository publisherRepository) {
        this.publisherRepository = publisherRepository;
    }

    public Publisher createPublisher(Publisher publisher) {

        if (publisherRepository.existsByName(publisher.getName())) {
            throw new RuntimeException("Publisher name already exists");
        }

        if (publisher.getEmail() != null
                && !publisher.getEmail().isBlank()
                && publisherRepository.existsByEmail(publisher.getEmail())) {
            throw new RuntimeException("Publisher email already exists");
        }

        publisher.setStatus("ACTIVE");

        return publisherRepository.save(publisher);
    }

    public List<Publisher> getAllPublishers() {
        return publisherRepository.findAll();
    }

    public Publisher getPublisherById(Long id) {
        return publisherRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Publisher not found"));
    }

    public Publisher updatePublisher(Long id, Publisher publisher) {

        Publisher existingPublisher = publisherRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Publisher not found"));

        if (publisherRepository.existsByName(publisher.getName())
                && !publisher.getName().equals(existingPublisher.getName())) {
            throw new RuntimeException("Publisher name already exists");
        }

        if (publisher.getEmail() != null
                && !publisher.getEmail().isBlank()
                && publisherRepository.existsByEmail(publisher.getEmail())
                && !publisher.getEmail().equals(existingPublisher.getEmail())) {
            throw new RuntimeException("Publisher email already exists");
        }

        existingPublisher.setName(publisher.getName());
        existingPublisher.setAddress(publisher.getAddress());
        existingPublisher.setPhone(publisher.getPhone());
        existingPublisher.setEmail(publisher.getEmail());

        return publisherRepository.save(existingPublisher);
    }

    public Publisher activatePublisher(Long id) {

        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Publisher not found"));

        if ("ACTIVE".equals(publisher.getStatus())) {
            throw new RuntimeException("Publisher is already active");
        }

        publisher.setStatus("ACTIVE");

        return publisherRepository.save(publisher);
    }

    public Publisher deactivatePublisher(Long id) {

        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Publisher not found"));

        if ("INACTIVE".equals(publisher.getStatus())) {
            throw new RuntimeException("Publisher is already inactive");
        }

        publisher.setStatus("INACTIVE");

        return publisherRepository.save(publisher);
    }
}