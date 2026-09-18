package com.library.management.service;

import com.library.management.dto.*;
import com.library.management.entity.Reader;
import com.library.management.entity.Role;
import com.library.management.entity.Staff;
import com.library.management.entity.User;
import com.library.management.exception.ResourceNotFoundException;
import com.library.management.repository.ReaderRepository;
import com.library.management.repository.RoleRepository;
import com.library.management.repository.StaffRepository;
import com.library.management.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final ReaderRepository readerRepository;
    private final StaffRepository staffRepository;

    public UserService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder, ReaderRepository readerRepository, StaffRepository staffRepository) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.readerRepository = readerRepository;
        this.staffRepository = staffRepository;
    }

    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (request.getEmail() != null
                && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));

        User user = new User();

        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(role);
        user.setStatus("ACTIVE");

        User savedUser = userRepository.save(user);

        if ("LIBRARIAN".equals(role.getName())) {

            Staff staff = new Staff();

            staff.setUser(savedUser);
            staff.setPhone("N/A");
            staff.setAddress(null);
            staff.setDateOfBirth(null);

            staffRepository.save(staff);
        }

        return toUserResponse(savedUser);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName(),
                user.getStatus()
        );
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    public UserDetailResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Reader reader = readerRepository
                .findByUserId(user.getId())
                .orElse(null);

        Staff staff = staffRepository
                .findByUserId(user.getId())
                .orElse(null);

        UserDetailResponse.ReaderInfo readerInfo = null;
        UserDetailResponse.StaffInfo staffInfo = null;

        if (reader != null) {

            readerInfo = new UserDetailResponse.ReaderInfo(
                    reader.getId(),
                    reader.getReaderCode(),
                    reader.getFullName(),
                    reader.getEmail(),
                    reader.getPhone(),
                    reader.getAddress(),
                    reader.getDateOfBirth(),
                    reader.getStatus(),
                    reader.getCreatedAt()
            );
        }

        if (staff != null) {

            staffInfo = new UserDetailResponse.StaffInfo(
                    staff.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    staff.getPhone(),
                    staff.getAddress(),
                    staff.getDateOfBirth(),
                    user.getStatus()
            );
        }

        return new UserDetailResponse(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().getName(),
                user.getStatus(),
                readerInfo,
                staffInfo
        );
    }

    public UserResponse updateUser(Long id, UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!user.getUsername().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (request.getEmail() != null
                && !request.getEmail().equals(user.getEmail())
                && userRepository.existsByEmailAndIdNot(
                request.getEmail(), id)) {
            throw new RuntimeException("Email already exists");
        }

        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found"));

        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setRole(role);

        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toUserResponse(userRepository.save(user));
    }

    // vô hiệu hoá user
    public UserResponse deactivateUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if ("INACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("User is already inactive");
        }

        user.setStatus("INACTIVE");

        return toUserResponse(userRepository.save(user));
    }

    // kích hoạt user
    public UserResponse activateUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if ("ACTIVE".equals(user.getStatus())) {
            throw new RuntimeException("User is already active");
        }

        user.setStatus("ACTIVE");

        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public Staff updateMyStaffProfile(
            String username,
            UpdateStaffProfileRequest request
    ) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!"LIBRARIAN".equals(user.getRole().getName())) {
            throw new RuntimeException(
                    "This profile is only available for staff"
            );
        }

        Staff staff = staffRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Staff profile not found"));

        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && !request.getEmail().equals(user.getEmail())
                && userRepository.existsByEmailAndIdNot(
                request.getEmail(),
                user.getId()
        )) {

            throw new RuntimeException("Email already exists");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        staff.setPhone(request.getPhone());
        staff.setAddress(request.getAddress());
        staff.setDateOfBirth(request.getDateOfBirth());

        userRepository.save(user);

        return staffRepository.save(staff);
    }

    public Staff getMyStaffProfile(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (!"LIBRARIAN".equals(user.getRole().getName())) {
            throw new RuntimeException(
                    "This profile is only available for staff"
            );
        }

        return staffRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Staff profile not found"
                        ));
    }
}