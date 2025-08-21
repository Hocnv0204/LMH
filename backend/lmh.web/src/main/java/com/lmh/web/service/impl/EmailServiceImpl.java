package com.lmh.web.service.impl;

import com.lmh.web.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    @Value("${spring.mail.username}")
    private String fromEmail ;
    @Value("${app.base-url}")
    private String baseUrl ;

    private final JavaMailSender mailSender ;
    
    @Override
    public void sendVerificationEmail(String toEmail , String token){
        log.info("Bắt đầu gửi email xác nhận đến: {}", toEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Verification Email");
            String verificationUrl = baseUrl + "/auth/verify-email/" + token;
            message.setText("Chào bạn,\n\n" +
                    "Cảm ơn bạn đã đăng ký tài khoản. " +
                    "Vui lòng click vào link sau để xác nhận tài khoản:\n\n" +
                    verificationUrl + "\n\n" +
                    "Link này sẽ hết hạn sau 24 giờ.\n\n" +
                    "Trân trọng!");
            mailSender.send(message);
            log.info("Gửi email xác nhận thành công đến: {}", toEmail);
        }catch(Exception e){
            log.error("Gửi email xác nhận thất bại đến {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Override
    public void sendResetPasswordEmail(String toEmail , String token){
        log.info("Bắt đầu gửi email reset password đến: {}", toEmail);
        try {
            SimpleMailMessage message = new SimpleMailMessage() ;
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Reset Password");
            String verificationUrl = baseUrl + "/auth/reset-password/" + token ;
            message.setText("Chào bạn,\n\n" +
                    "Đây là mail xác nhận đặt lại mật khẩu" +
                    "Vui lòng click vào link sau để xác nhận tài khoản và đặt lại mật khẩu:\n\n" +
                    verificationUrl + "\n\n" +
                    "Link này sẽ hết hạn sau 24 giờ.\n\n" +
                    "Trân trọng!");
            mailSender.send(message);
            log.info("Gửi email reset password thành công đến: {}", toEmail);
        } catch(Exception e) {
            log.error("Gửi email reset password thất bại đến {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
