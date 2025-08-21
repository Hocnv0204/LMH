package com.lmh.web.controller;

import com.cloudinary.Api;

import com.lmh.web.dto.request.authentication.*;

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
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import java.text.ParseException;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService ;

    @GetMapping("/welcome")
	public String welcome(){
		return "Welcome to spring boot!";
	}  

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


    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@RequestBody RegisterRequest request){
        authenticationService.register(request);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .data("Verification in email")
                        .build()
        ) ;
    }
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<?>> verifyEmail(@RequestParam String token){
        authenticationService.verifyEmail(token);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .data("Create account successful")
                        .build()
        ) ;
    }

    @PostMapping("/resend-register")
    public ResponseEntity<ApiResponse<?>> resendVerifyEmail(@RequestBody ResendTokenRequest request){
        authenticationService.resendVerifyEmail(request);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .data("Resend successful")
                        .build()
        ) ;
    }

    @PostMapping("/resend-reset-password")
    public ResponseEntity<ApiResponse<?>> resendResetPassword(@RequestBody ResendTokenRequest request){
        authenticationService.resendResetPassword(request);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .data("Resend successful")
                        .build()
        ) ;
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@RequestBody ForgotPasswordRequest request){
        authenticationService.forgotPassword(request);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .data("Click to link in your email")
                        .build()
        ) ;
    }
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@RequestBody ResetPasswordRequest request){
        authenticationService.resetPassword(request);
        return ResponseEntity.ok(
                ApiResponse.builder()
                        .success(true)
                        .data("Reset password successful")
                        .build()
        ) ;
    }

}
