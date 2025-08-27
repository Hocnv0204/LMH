package com.lmh.web.configuration;

import com.lmh.web.common.Role;
import com.lmh.web.model.User;
import com.lmh.web.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;


import java.time.LocalDateTime;


@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfiguration {
    private final UserRepository userRepository ;
    private final PasswordEncoder passwordEncoder ;
    @Bean
    ApplicationRunner applicationRunner() {
        return args -> {
            if (!userRepository.existsByUsernameIgnoreCase("admin")) {
                var user = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .role(Role.ADMIN.name())
                        .point(0)
                        .credit(10000)
                        .enable(true)
                        .createdAt(LocalDateTime.now())

                        .build();
                userRepository.save(user);
            }
        } ;

    }
}
