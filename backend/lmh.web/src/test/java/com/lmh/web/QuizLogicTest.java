package com.lmh.web;

import com.lmh.web.model.QuizSession;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;

public class QuizLogicTest {
    
    @Test
    public void testQuestionReinsertion() {
        // Tạo danh sách câu hỏi mẫu
        List<QuizSession.QuizQuestion> questions = new ArrayList<>();
        
        for (int i = 0; i < 5; i++) {
            QuizSession.QuizQuestion question = QuizSession.QuizQuestion.builder()
                    .questionId("q" + i)
                    .question("Question " + i)
                    .correctAnswer("Answer " + i)
                    .options(List.of("A", "B", "C", "D"))
                    .isAnswered(false)
                    .build();
            questions.add(question);
        }
        
        // Test logic chèn lại câu hỏi
        QuizSession.QuizQuestion currentQuestion = questions.get(0);
        questions.remove(0);
        
        // Chèn lại câu hỏi sau 2-3 vị trí
        int insertPosition = Math.min(2 + (int)(Math.random() * 2), questions.size());
        questions.add(insertPosition, currentQuestion);
        
        // Kiểm tra câu hỏi đã được chèn lại
        assertTrue(questions.contains(currentQuestion));
        assertEquals(5, questions.size());
        
        // Kiểm tra vị trí chèn hợp lý
        assertTrue(insertPosition >= 2 && insertPosition <= 4);
    }
    
    @Test
    public void testQuizSessionCreation() {
        QuizSession session = QuizSession.builder()
                .sessionId("test_session")
                .userId(1)
                .collectionId(1)
                .totalQuestions(5)
                .currentQuestionIndex(0)
                .questions(new ArrayList<>())
                .questionAttempts(new java.util.HashMap<>())
                .createdAt(java.time.LocalDateTime.now())
                .lastActivityAt(java.time.LocalDateTime.now())
                .build();
        
        assertNotNull(session);
        assertEquals("test_session", session.getSessionId());
        assertEquals(1, session.getUserId());
        assertEquals(0, session.getCurrentQuestionIndex());
    }
}
