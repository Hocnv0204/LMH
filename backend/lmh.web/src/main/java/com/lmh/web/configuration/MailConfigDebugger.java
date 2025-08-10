package com.lmh.web.configuration;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class MailConfigDebugger {

    @Value("${spring.mail.host:NOT_SET}")
    private String mailHost;

    @Value("${spring.mail.port:NOT_SET}")
    private String mailPort;

    @Autowired
    private JavaMailSender mailSender;

    @PostConstruct
    public void debugConfig() {
        log.info("=== MAIL CONFIG DEBUG ===");
        log.info("spring.mail.host from @Value: {}", mailHost);
        log.info("spring.mail.port from @Value: {}", mailPort);

        if (mailSender instanceof JavaMailSenderImpl) {
            JavaMailSenderImpl impl = (JavaMailSenderImpl) mailSender;
            log.info("Actual JavaMailSender host: {}", impl.getHost());
            log.info("Actual JavaMailSender port: {}", impl.getPort());
            log.info("Actual JavaMailSender properties: {}", impl.getJavaMailProperties());
        }
        log.info("=========================");
    }
}