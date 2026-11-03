package com.airesumeanalyzer.backend;

import com.airesumeanalyzer.backend.dto.AuthResponse;
import com.airesumeanalyzer.backend.dto.LoginRequest;
import com.airesumeanalyzer.backend.dto.RegisterRequest;
import com.airesumeanalyzer.backend.entity.User;
import com.airesumeanalyzer.backend.exception.ApiException;
import com.airesumeanalyzer.backend.repository.UserRepository;
import com.airesumeanalyzer.backend.security.JwtTokenProvider;
import com.airesumeanalyzer.backend.security.UserDetailsImpl;
import com.airesumeanalyzer.backend.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;
import java.util.function.Function;

import static org.junit.jupiter.api.Assertions.*;

public class UserServiceImplTest {

    private InMemoryUserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private AuthenticationManager authenticationManager;
    private JwtTokenProvider jwtTokenProvider;
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userRepository = new InMemoryUserRepository();
        passwordEncoder = new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                return "hashed_" + rawPassword;
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                return ("hashed_" + rawPassword).equals(encodedPassword);
            }
        };

        authenticationManager = new AuthenticationManager() {
            @Override
            public Authentication authenticate(Authentication authentication) throws AuthenticationException {
                String email = (String) authentication.getPrincipal();
                String pwd = (String) authentication.getCredentials();

                if ("wrong@example.com".equals(email) || "wrongpassword".equals(pwd)) {
                    throw new BadCredentialsException("Invalid credentials");
                }

                UserDetailsImpl userDetails = new UserDetailsImpl(
                        1L, email, "hashed_" + pwd,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                );
                return new UsernamePasswordAuthenticationToken(userDetails, pwd, userDetails.getAuthorities());
            }
        };

        jwtTokenProvider = new JwtTokenProvider() {
            @Override
            public String generateJwtToken(Authentication authentication) {
                return "mock_jwt_token_for_" + authentication.getName();
            }
        };

        userService = new UserServiceImpl(userRepository, passwordEncoder, authenticationManager, jwtTokenProvider);
    }

    @Test
    void testRegisterUser_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setRole("USER");

        AuthResponse authResponse = userService.registerUser(request);

        assertNotNull(authResponse);
        assertEquals("test@example.com", authResponse.getEmail());
        assertTrue(authResponse.getToken().contains("test@example.com"));
        assertEquals("USER", authResponse.getRole());
        assertTrue(userRepository.existsByEmail("test@example.com"));
    }

    @Test
    void testRegisterUser_DuplicateEmail() {
        User existing = User.builder()
                .id(1L)
                .email("duplicate@example.com")
                .passwordHash("hashed_pwd")
                .build();
        userRepository.save(existing);

        RegisterRequest request = new RegisterRequest();
        request.setEmail("duplicate@example.com");
        request.setPassword("password123");
        request.setRole("USER");

        assertThrows(ApiException.class, () -> userService.registerUser(request));
    }

    @Test
    void testLoginUser_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        AuthResponse authResponse = userService.loginUser(request);

        assertNotNull(authResponse);
        assertEquals("test@example.com", authResponse.getEmail());
        assertTrue(authResponse.getToken().contains("test@example.com"));
        assertEquals("USER", authResponse.getRole());
    }

    @Test
    void testLoginUser_InvalidCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("wrong@example.com");
        request.setPassword("wrongpassword");

        assertThrows(ApiException.class, () -> userService.loginUser(request));
    }

    // Lightweight in-memory stub for UserRepository
    private static class InMemoryUserRepository implements UserRepository {
        private final Map<Long, User> storage = new HashMap<>();
        private long idGen = 1L;

        @Override
        public Optional<User> findByEmail(String email) {
            return storage.values().stream().filter(u -> email.equalsIgnoreCase(u.getEmail())).findFirst();
        }

        @Override
        public boolean existsByEmail(String email) {
            return storage.values().stream().anyMatch(u -> email.equalsIgnoreCase(u.getEmail()));
        }

        @Override
        public <S extends User> S save(S entity) {
            if (entity.getId() == null) {
                entity.setId(idGen++);
            }
            storage.put(entity.getId(), entity);
            return entity;
        }

        @Override public Optional<User> findById(Long aLong) { return Optional.ofNullable(storage.get(aLong)); }
        @Override public boolean existsById(Long aLong) { return storage.containsKey(aLong); }
        @Override public List<User> findAll() { return new ArrayList<>(storage.values()); }
        @Override public List<User> findAllById(Iterable<Long> longs) { return new ArrayList<>(); }
        @Override public long count() { return storage.size(); }
        @Override public void deleteById(Long aLong) { storage.remove(aLong); }
        @Override public void delete(User entity) { storage.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends Long> longs) {}
        @Override public void deleteAll(Iterable<? extends User> entities) {}
        @Override public void deleteAll() { storage.clear(); }
        @Override public <S extends User> List<S> saveAll(Iterable<S> entities) { return new ArrayList<>(); }
        @Override public void flush() {}
        @Override public <S extends User> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends User> List<S> saveAllAndFlush(Iterable<S> entities) { return new ArrayList<>(); }
        @Override public void deleteAllInBatch(Iterable<User> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<Long> longs) {}
        @Override public void deleteAllInBatch() {}
        @Override public User getOne(Long aLong) { return storage.get(aLong); }
        @Override public User getById(Long aLong) { return storage.get(aLong); }
        @Override public User getReferenceById(Long aLong) { return storage.get(aLong); }
        @Override public <S extends User> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends User> List<S> findAll(Example<S> example) { return new ArrayList<>(); }
        @Override public <S extends User> List<S> findAll(Example<S> example, Sort sort) { return new ArrayList<>(); }
        @Override public <S extends User> Page<S> findAll(Example<S> example, Pageable pageable) { return Page.empty(); }
        @Override public <S extends User> long count(Example<S> example) { return 0; }
        @Override public <S extends User> boolean exists(Example<S> example) { return false; }
        @Override public <S extends User, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<User> findAll(Sort sort) { return new ArrayList<>(); }
        @Override public Page<User> findAll(Pageable pageable) { return Page.empty(); }
    }
}
