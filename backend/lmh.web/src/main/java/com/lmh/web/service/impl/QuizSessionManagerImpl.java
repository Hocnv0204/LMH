package com.lmh.web.service.impl;

import com.lmh.web.model.QuizSession;
import com.lmh.web.service.QuizSessionManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class QuizSessionManagerImpl implements QuizSessionManager {
    
    private final Map<String, QuizSession> quizSessions = new ConcurrentHashMap<>();
    
    @Override
    public void storeSession(String sessionId, QuizSession session) {
        quizSessions.put(sessionId, session);
    }
    
    @Override
    public QuizSession getSession(String sessionId) {
        return quizSessions.get(sessionId);
    }
    
    @Override
    public void removeSession(String sessionId) {
        quizSessions.remove(sessionId);
    }
    
    @Override
    public Map<String, QuizSession> getAllSessions() {
        return new ConcurrentHashMap<>(quizSessions);
    }
    
    @Override
    @Scheduled(fixedRate = 300000) // Run every 5 minutes
    public void cleanupExpiredSessions() {
        try {
            LocalDateTime cutoffTime = LocalDateTime.now().minusHours(2); // Remove sessions older than 2 hours
            
            quizSessions.entrySet().removeIf(entry -> {
                QuizSession session = entry.getValue();
                boolean isExpired = session.getLastActivityAt().isBefore(cutoffTime);
                if (isExpired) {
                    log.debug("Removing expired quiz session: {}", entry.getKey());
                }
                return isExpired;
            });
            
            log.info("Quiz cleanup completed. Active sessions: {}", quizSessions.size());
        } catch (Exception e) {
            log.error("Error during quiz cleanup: ", e);
        }
    }
}

