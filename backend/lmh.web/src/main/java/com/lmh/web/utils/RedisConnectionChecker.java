package com.lmh.web.utils;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisConnectionChecker {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @PostConstruct
    public void checkConnection() {
        try {
            String pong = redisTemplate.getConnectionFactory()
                    .getConnection()
                    .ping();
            if ("PONG".equalsIgnoreCase(pong)) {
                System.out.println("✅ Redis connected successfully!");
            } else {
                System.err.println("⚠️ Redis ping returned: " + pong);
            }
        } catch (Exception e) {
            System.err.println("❌ Redis connection failed: " + e.getMessage());
        }
    }
}
