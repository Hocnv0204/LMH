package com.lmh.web.service;

public interface EmailService {
    void sendVerificationEmail(String toEmail , String token) ;
    void sendResetPasswordEmail(String toEmail , String token) ;
}
