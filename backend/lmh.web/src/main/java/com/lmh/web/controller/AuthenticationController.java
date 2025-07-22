package com.lmh.web.controller;

import com.cloudinary.Api;
import com.lmh.web.dto.request.authentication.IntrospectRequest;
import com.lmh.web.dto.request.authentication.LoginRequest;
import com.lmh.web.dto.request.authentication.LogoutRequest;
import com.lmh.web.dto.request.authentication.RefreshTokenRequest;
import com.lmh.web.dto.response.ApiResponse;
import com.lmh.web.dto.response.AuthenticationResponse;
import com.lmh.web.dto.response.user.IntrospectResponse;
import com.lmh.web.service.AuthenticationService;
import com.nimbusds.jose.JOSEException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/authentication")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService ;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@RequestBody LoginRequest request){
        AuthenticationResponse response = authenticationService.login(request) ;
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()

        );
    }
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data("Logout successful")
                        .build()
        ) ;
    }
    @PostMapping("/introspect")
    public ResponseEntity<ApiResponse<?>> introspect(@RequestBody IntrospectRequest request) throws ParseException, JOSEException {
        IntrospectResponse response = authenticationService.introspect(request);
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()
        ) ;
    }
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<?>> refresh(@RequestBody RefreshTokenRequest request) throws ParseException, JOSEException {
        AuthenticationResponse response = authenticationService.refreshToken(request) ;
        return ResponseEntity.ok().body(
                ApiResponse.builder()
                        .success(true)
                        .data(response)
                        .build()

        );
    }
}
