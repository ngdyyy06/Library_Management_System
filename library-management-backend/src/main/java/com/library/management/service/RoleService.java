package com.library.management.service;

import com.library.management.entity.Role;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.RoleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));
    }

    public Role createRole(String name) {

        if (roleRepository.findAll().stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase(name))) {
            throw new RuntimeException("Role already exists");
        }

        Role role = new Role();
        role.setName(name);

        return roleRepository.save(role);
    }
}