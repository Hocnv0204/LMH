package com.lmh.web.service.impl;

import com.lmh.web.dto.response.quiz.QuizQuestionResponse;
import com.lmh.web.dto.response.quiz.QuizSessionResponse;
import com.lmh.web.dto.request.quiz.StartQuizRequest;
import com.lmh.web.dto.request.quiz.AnswerQuizRequest;
import com.lmh.web.exception.AppException;
import com.lmh.web.exception.ErrorCode;
import com.lmh.web.model.CollectionVoca;
import com.lmh.web.model.Vocabulary;
import com.lmh.web.model.QuizSession;
import com.lmh.web.repository.CollectionVocaRepository;
import com.lmh.web.repository.VocabularyRepository;
import com.lmh.web.service.QuizService;
import com.lmh.web.service.QuizSessionManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {
    
    private final VocabularyRepository vocabularyRepository;
    private final CollectionVocaRepository collectionVocaRepository;
    private final QuizSessionManager quizSessionManager;
    
    @Override
    public QuizSessionResponse startQuiz(StartQuizRequest request, Integer userId) {
        // Validate collection exists and user has access
        CollectionVoca collection = collectionVocaRepository.findById(request.getCollectionId())
                .orElseThrow(() -> new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS));
        
        // Get vocabularies from the collection with limit
        PageRequest pageRequest = PageRequest.of(0, request.getTotalQuestions());
        List<Vocabulary> vocabularies = vocabularyRepository.findRandomByCollectionId(request.getCollectionId(), pageRequest);
        
        if (vocabularies.size() < request.getTotalQuestions()) {
            throw new AppException(ErrorCode.INVALID_DATA, 
                "Collection doesn't have enough vocabularies. Available: " + vocabularies.size());
        }
        
        // Generate session ID
        String sessionId = generateSessionId();
        
        // Generate quiz questions (no need to shuffle again since repository already returns random)
        List<QuizSession.QuizQuestion> questions = generateQuizQuestions(vocabularies, request.getTotalQuestions(), request.getSeed());
        
        // Create quiz session
        QuizSession session = QuizSession.builder()
                .sessionId(sessionId)
                .userId(userId)
                .collectionId(request.getCollectionId())
                .totalQuestions(request.getTotalQuestions())
                .currentQuestionIndex(0)
                .questions(questions)
                .questionAttempts(new HashMap<>())
                .createdAt(LocalDateTime.now())
                .lastActivityAt(LocalDateTime.now())
                .build();
        
        quizSessionManager.storeSession(sessionId, session);
        
        return QuizSessionResponse.builder()
                .sessionId(sessionId)
                .collectionId(request.getCollectionId())
                .totalQuestions(request.getTotalQuestions())
                .currentQuestionNumber(1)
                .message("Quiz đã bắt đầu thành công")
                .build();
    }
    
    @Override
    public QuizQuestionResponse answerQuestion(AnswerQuizRequest request, String sessionId, Integer userId) {
        QuizSession session = getAndValidateSession(sessionId, userId);
        
        // Find the question
        QuizSession.QuizQuestion question = session.getQuestions().get(session.getCurrentQuestionIndex());
        
        if (!question.getQuestionId().equals(request.getQuestionId())) {
            throw new AppException(ErrorCode.INVALID_DATA, "Question ID mismatch");
        }
        
        // Update attempts count
        session.getQuestionAttempts().merge(request.getQuestionId(), 1, Integer::sum);
        session.setLastActivityAt(LocalDateTime.now());
        
        boolean isCorrect = question.getCorrectAnswer().equals(request.getAnswer());
        
        if (isCorrect) {
            // Mark question as answered and move to next
            question.setAnswered(true);
            session.setCurrentQuestionIndex(session.getCurrentQuestionIndex() + 1);
            
            // Check if quiz is completed
            if (session.getCurrentQuestionIndex() >= session.getTotalQuestions()) {
                return QuizQuestionResponse.builder()
                        .questionId(question.getQuestionId())
                        .question(question.getQuestion())
                        .options(question.getOptions())
                        .correctAnswer(question.getCorrectAnswer())
                        .isCorrect(true)
                        .message("Chính xác! Quiz hoàn thành!")
                        .isCompleted(true)
                        .currentQuestionNumber(session.getTotalQuestions())
                        .totalQuestions(session.getTotalQuestions())
                        .build();
            }
            
            return QuizQuestionResponse.builder()
                    .questionId(question.getQuestionId())
                    .question(question.getQuestion())
                    .options(question.getOptions())
                    .correctAnswer(question.getCorrectAnswer())
                    .isCorrect(true)
                    .message("Chính xác! Chuyển sang câu hỏi tiếp theo.")
                    .isCompleted(false)
                    .currentQuestionNumber(session.getCurrentQuestionIndex())
                    .totalQuestions(session.getTotalQuestions())
                    .build();
        } else {
            // Wrong answer, stay on same question
            return QuizQuestionResponse.builder()
                    .questionId(question.getQuestionId())
                    .question(question.getQuestion())
                    .options(question.getOptions())
                    .correctAnswer(null) // Không tiết lộ đáp án đúng
                    .isCorrect(false)
                    .message("Sai rồi! Hãy thử lại.")
                    .isCompleted(false)
                    .currentQuestionNumber(session.getCurrentQuestionIndex() + 1)
                    .totalQuestions(session.getTotalQuestions())
                    .build();
        }
    }
    
    @Override
    public QuizQuestionResponse getCurrentQuestion(String sessionId, Integer userId) {
        QuizSession session = getAndValidateSession(sessionId, userId);
        
        if (session.getCurrentQuestionIndex() >= session.getTotalQuestions()) {
            throw new AppException(ErrorCode.INVALID_DATA, "Quiz already completed");
        }
        
        QuizSession.QuizQuestion question = session.getQuestions().get(session.getCurrentQuestionIndex());
        
        return QuizQuestionResponse.builder()
                .questionId(question.getQuestionId())
                .question(question.getQuestion())
                .options(question.getOptions())
                .correctAnswer(null) // Không tiết lộ đáp án đúng
                .isCorrect(false)
                .message("Câu hỏi hiện tại")
                .isCompleted(false)
                .currentQuestionNumber(session.getCurrentQuestionIndex() + 1)
                .totalQuestions(session.getTotalQuestions())
                .build();
    }
    
    @Override
    public void endQuiz(String sessionId, Integer userId) {
        QuizSession session = getAndValidateSession(sessionId, userId);
        quizSessionManager.removeSession(sessionId);
    }
    
    private QuizSession getAndValidateSession(String sessionId, Integer userId) {
        QuizSession session = quizSessionManager.getSession(sessionId);
        if (session == null) {
            throw new AppException(ErrorCode.INVALID_DATA, "Quiz session not found");
        }
        if (!session.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Access denied to this quiz session");
        }
        return session;
    }
    
    private List<QuizSession.QuizQuestion> generateQuizQuestions(List<Vocabulary> vocabularies, int totalQuestions, Long seed) {
        // Repository already returns random vocabularies, but we can apply seed-based shuffling if needed
        List<Vocabulary> selectedVocabularies = vocabularies;
        
        if (seed != null) {
            // Apply deterministic shuffling based on seed
            selectedVocabularies = new ArrayList<>(vocabularies);
            Collections.shuffle(selectedVocabularies, new Random(seed));
        }
        
        return selectedVocabularies.stream()
                .map(this::createQuizQuestion)
                .collect(Collectors.toList());
    }
    
    private QuizSession.QuizQuestion createQuizQuestion(Vocabulary vocabulary) {
        String questionId = UUID.randomUUID().toString();
        String question = vocabulary.getTerm(); // Chỉ hiển thị từ tiếng Anh
        String correctAnswer = vocabulary.getVi();
        
        // Generate distractors (wrong options) - đảm bảo có đúng 4 đáp án
        List<String> options = generateDistractors(vocabulary, correctAnswer);
        options.add(correctAnswer);
        
        // Đảm bảo có đúng 4 đáp án
        while (options.size() < 4) {
            options.add("Không xác định");
        }
        
        // Shuffle options để đáp án đúng không luôn ở vị trí cố định
        Collections.shuffle(options);
        
        return QuizSession.QuizQuestion.builder()
                .questionId(questionId)
                .vocabularyId(vocabulary.getId())
                .question(question)
                .correctAnswer(correctAnswer)
                .options(options)
                .isAnswered(false)
                .build();
    }
    
    private List<String> generateDistractors(Vocabulary currentVocab, String correctAnswer) {
        List<String> distractors = new ArrayList<>();
        
        // Get other vocabularies from the same collection for distractors (limit to 20 for better variety)
        PageRequest pageRequest = PageRequest.of(0, 20);
        List<Vocabulary> otherVocabs = vocabularyRepository.findRandomByCollectionId(currentVocab.getCollection().getId(), pageRequest)
                .stream()
                .filter(v -> !v.getId().equals(currentVocab.getId()))
                .collect(Collectors.toList());
        
        // Try to find vocabularies with same part-of-speech first (ưu tiên cùng loại từ)
        List<Vocabulary> sameTypeVocabs = otherVocabs.stream()
                .filter(v -> Objects.equals(v.getType(), currentVocab.getType()))
                .collect(Collectors.toList());
        
        // Add distractors from same type first
        for (Vocabulary vocab : sameTypeVocabs) {
            if (distractors.size() >= 3) break;
            if (!vocab.getVi().equals(correctAnswer) && !distractors.contains(vocab.getVi())) {
                distractors.add(vocab.getVi());
            }
        }
        
        // If we still need more distractors, add from other types
        for (Vocabulary vocab : otherVocabs) {
            if (distractors.size() >= 3) break;
            if (!vocab.getVi().equals(correctAnswer) && !distractors.contains(vocab.getVi())) {
                distractors.add(vocab.getVi());
            }
        }
        
        // If still not enough, add some generic distractors
        while (distractors.size() < 3) {
            String genericDistractor = "Không xác định";
            if (!distractors.contains(genericDistractor)) {
                distractors.add(genericDistractor);
            }
        }
        
        // Đảm bảo trả về đúng 3 đáp án nhiễu
        return distractors.subList(0, Math.min(3, distractors.size()));
    }
    
    private String generateSessionId() {
        return "quiz_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
