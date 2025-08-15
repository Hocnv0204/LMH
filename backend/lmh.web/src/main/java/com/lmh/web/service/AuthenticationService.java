package com.lmh.web.service;


import com.lmh.web.dto.request.authentication.*;

import com.lmh.web.dto.request.authentication.IntrospectRequest;
import com.lmh.web.dto.request.authentication.LoginRequest;
import com.lmh.web.dto.request.authentication.LogoutRequest;
import com.lmh.web.dto.request.authentication.RefreshTokenRequest;

import com.lmh.web.dto.response.AuthenticationResponse;
import com.lmh.web.dto.response.user.IntrospectResponse;
import com.lmh.web.model.User;
import com.nimbusds.jose.JOSEException;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;

import java.text.ParseException;

public interface AuthenticationService {
    AuthenticationResponse login(LoginRequest request) ;
    IntrospectResponse introspect(IntrospectRequest request) throws JOSEException , ParseException;
    void logout(LogoutRequest request) throws ParseException, JOSEException;
    AuthenticationResponse refreshToken(RefreshTokenRequest request) throws ParseException, JOSEException;
    String generateAccessToken(User user) ;
    String generateRefreshToken(User user ) ;

    void register(RegisterRequest request) ;
    void verifyEmail(String token) ;
    void resendVerifyEmail(ResendTokenRequest request) ;
    void resendResetPassword(ResendTokenRequest request) ;
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request) ;

    boolean verifyUserIdentity(String token, int userId);

}
