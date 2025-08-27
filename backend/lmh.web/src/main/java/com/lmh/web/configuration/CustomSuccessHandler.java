package com.lmh.web.configuration;

import com.lmh.web.common.Role;
import com.lmh.web.dto.response.AuthenticationResponse;
import com.lmh.web.model.User;
import com.lmh.web.repository.UserRepository;
import com.lmh.web.service.AuthenticationService;
import com.lmh.web.service.RedisService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

import java.time.LocalDateTime;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CustomSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {
    private final UserRepository userRepository ;
    private final AuthenticationService authenticationService ;
    private final RedisService redisService ;

    @Value("${app.base-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest httpServletRequest , HttpServletResponse response ,
                                        Authentication authentication
                                        ) throws ServletException , IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal() ;
        String email = oAuth2User.getAttribute("email") ;
        String name = oAuth2User.getAttribute("name") ;
        String username = oAuth2User.getAttribute("sub") ;
        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(
                () -> {
                    User newUser = User.builder()
                            .name(name)
                            .email(email)
                            .role(Role.USER.name())
                            .username(username)
                            .deleteFlag(false)
                            .credit(10)
                            .point(0)
                            .enable(true)
                            .createdAt(LocalDateTime.now())
                            .build();
                    return userRepository.save(newUser);
                }
        );
        String accessToken = authenticationService.generateAccessToken(user) ;
        String refreshToken = authenticationService.generateRefreshToken(user);
        redisService.savedRefreshToken(user.getId() , refreshToken);
        AuthenticationResponse authenticationResponse = AuthenticationResponse.builder()
                .authenticated(true)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build() ;
        String redirectUrl = String.format("%s/auth/google-callback?accessToken=%s&refreshToken=%s&authenticated=true",
                frontendUrl, accessToken, refreshToken);

        response.sendRedirect(redirectUrl);
    }
}
