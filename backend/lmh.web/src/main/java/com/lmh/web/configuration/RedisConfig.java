package com.lmh.web.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class RedisConfig {
    @Bean
    RedisCacheManager redisCacheManager(RedisConnectionFactory redisConnectionFactory){
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .entryTtl(Duration.ofMinutes(30)); // TTL mặc định là 30 phút

        // Tạo một map để chứa các cấu hình cache riêng
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // Cấu hình cho cache 'users' với TTL là 5 phút
        cacheConfigurations.put("users", defaultConfig.entryTtl(Duration.ofMinutes(5)));

        return RedisCacheManager.builder(redisConnectionFactory)
                .cacheDefaults(defaultConfig) // Áp dụng cấu hình mặc định
                .withInitialCacheConfigurations(cacheConfigurations) // Áp dụng các cấu hình riêng
                .build();
    }
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        // Tạo một instance của RedisTemplate
        RedisTemplate<String, Object> template = new RedisTemplate<>();

        // Thiết lập connection factory để template biết cách kết nối đến Redis
        template.setConnectionFactory(connectionFactory);

        // Cấu hình serializer cho key. Sử dụng StringRedisSerializer để đảm bảo key là chuỗi có thể đọc được.
        template.setKeySerializer(new StringRedisSerializer());

        // Cấu hình serializer cho các key của Hash. Tương tự, sử dụng StringRedisSerializer.
        template.setHashKeySerializer(new StringRedisSerializer());

        // Cấu hình serializer cho value. Sử dụng GenericJackson2JsonRedisSerializer để lưu trữ đối tượng Java dưới dạng JSON.
        // Điều này giúp tăng khả năng tương tác với các hệ thống khác.
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());

        // Cấu hình serializer cho các value của Hash. Tương tự, sử dụng GenericJackson2JsonRedisSerializer.
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        // Kích hoạt hỗ trợ giao dịch (transaction support).
        // Điều này cho phép nhóm nhiều lệnh Redis vào một giao dịch nguyên tử.
        template.setEnableTransactionSupport(true); // [4, 17, 23]

        // Gọi afterPropertiesSet để khởi tạo template sau khi đã cấu hình xong
        template.afterPropertiesSet();

        return template;

    }
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
} 