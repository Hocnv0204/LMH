package com.lmh.web.service.impl;

import com.lmh.web.dto.request.quiz.StartQuizRequest;
import com.lmh.web.dto.request.quiz.AnswerRequest;
import com.lmh.web.dto.response.quiz.QuizQuestionResponse;
import com.lmh.web.dto.response.quiz.QuizSessionResponse;
import com.lmh.web.dto.response.quiz.AnswerResponse;
import com.lmh.web.exception.AppException;
import com.lmh.web.exception.ErrorCode;
import com.lmh.web.model.CollectionVoca;
import com.lmh.web.model.Vocabulary;
import com.lmh.web.model.QuizSession;
import com.lmh.web.repository.CollectionVocaRepository;
import com.lmh.web.repository.VocabularyRepository;
import com.lmh.web.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizServiceImpl implements QuizService {
    
    private final VocabularyRepository vocabularyRepository;
    private final CollectionVocaRepository collectionVocaRepository;
    
    // Lưu trữ session quiz trong memory (có thể thay bằng Redis sau)
    private final Map<String, QuizSession> quizSessions = new ConcurrentHashMap<>();

    @Override
    public QuizSessionResponse startQuiz(StartQuizRequest request, Integer userId) {
        log.info("Bắt đầu quiz cho user ID: {}, collection ID: {}, số câu hỏi: {}", 
                userId, request.getCollectionId(), request.getQuestionCount());
                
        // Validate collection exists and user has access
        CollectionVoca collection = collectionVocaRepository.findById(request.getCollectionId())
                .orElseThrow(() -> {
                    log.warn("Bắt đầu quiz thất bại: Không tìm thấy collection ID: {}", request.getCollectionId());
                    return new AppException(ErrorCode.COLLECTION_IS_NOT_EXISTS);
                });
        
        // Check if user owns this collection
        if (!collection.getUser().getId().equals(userId)) {
            log.warn("Bắt đầu quiz thất bại: User ID {} không có quyền truy cập collection ID {}", 
                    userId, request.getCollectionId());
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn không có quyền truy cập collection này");
        }

        // Get vocabularies from the collection
        List<Vocabulary> vocabularies = vocabularyRepository.findByCollectionId(request.getCollectionId());
        log.debug("Tìm thấy {} từ vựng trong collection ID: {}", vocabularies.size(), request.getCollectionId());

        if (vocabularies.size() < request.getQuestionCount()) {
            log.warn("Bắt đầu quiz thất bại: Collection chỉ có {} từ vựng, yêu cầu {} câu hỏi", 
                    vocabularies.size(), request.getQuestionCount());
            throw new AppException(ErrorCode.INVALID_DATA,
                "Collection không có đủ từ vựng. Có sẵn: " + vocabularies.size());
        }
        
        // Generate session ID
        String sessionId = generateSessionId();
        log.debug("Tạo session quiz với ID: {}", sessionId);
        
        // Generate quiz questions with random selection
        List<QuizSession.QuizQuestion> questions = generateQuizQuestions(vocabularies, request.getQuestionCount(), request.getSeed());

        // Create quiz session
        QuizSession session = QuizSession.builder()
                .sessionId(sessionId)
                .userId(userId)
                .collectionId(request.getCollectionId())
                .totalQuestions(request.getQuestionCount())
                .currentQuestionIndex(0)
                .questions(questions)
                .questionAttempts(new HashMap<>())
                .createdAt(LocalDateTime.now())
                .lastActivityAt(LocalDateTime.now())
                .build();
        
        quizSessions.put(sessionId, session);
        log.info("Tạo quiz session thành công: {} cho user ID: {}, collection ID: {}", 
                sessionId, userId, request.getCollectionId());

        return QuizSessionResponse.builder()
                .sessionId(sessionId)
                .collectionId(request.getCollectionId())
                .totalQuestions(request.getQuestionCount())
                .currentQuestionNumber(1)
                .message("Quiz đã bắt đầu thành công")
                .build();
    }
    
    @Override
    public AnswerResponse answerQuestion(AnswerRequest request, Integer userId) {
        log.info("User ID {} trả lời câu hỏi {} trong quiz {}", userId, request.getQuestionId(), request.getQuizId());
        QuizSession session = getAndValidateSession(request.getQuizId(), userId);

        // Find the current question
        QuizSession.QuizQuestion currentQuestion = session.getQuestions().get(session.getCurrentQuestionIndex());

        if (!currentQuestion.getQuestionId().equals(request.getQuestionId())) {
            log.warn("Question ID không khớp: expect {} nhưng nhận {}", currentQuestion.getQuestionId(), request.getQuestionId());
            throw new AppException(ErrorCode.INVALID_DATA, "Question ID không khớp");
        }
        
        // Update attempts count
        session.getQuestionAttempts().merge(request.getQuestionId(), 1, Integer::sum);
        session.setLastActivityAt(LocalDateTime.now());
        
        boolean isCorrect = currentQuestion.getCorrectAnswer().equals(request.getSelectedAnswer());
        log.debug("Câu trả lời {} cho câu hỏi {}: {}", request.getSelectedAnswer(), request.getQuestionId(), 
                isCorrect ? "Đúng" : "Sai");

        if (isCorrect) {
            // Mark question as answered and move to next
            currentQuestion.setAnswered(true);
            session.setCurrentQuestionIndex(session.getCurrentQuestionIndex() + 1);
            
            // Check if quiz is completed
            if (session.getCurrentQuestionIndex() >= session.getTotalQuestions()) {
                log.info("Quiz hoàn thành cho user ID: {}, session: {}", userId, request.getQuizId());
                return AnswerResponse.builder()
                        .correct(true)
                        .message("Chính xác! Quiz hoàn thành!")
                        .isCompleted(true)
                        .currentQuestionNumber(session.getTotalQuestions())
                        .totalQuestions(session.getTotalQuestions())
                        .build();
            }
            
            // Get next question
            QuizSession.QuizQuestion nextQuestion = session.getQuestions().get(session.getCurrentQuestionIndex());
            log.debug("Chuyển sang câu hỏi tiếp theo: {}", nextQuestion.getQuestionId());

            return AnswerResponse.builder()
                    .correct(true)
                    .message("Chính xác! Chuyển sang câu hỏi tiếp theo.")
                    .nextQuestion(createQuizQuestionResponse(nextQuestion, session))
                    .isCompleted(false)
                    .currentQuestionNumber(session.getCurrentQuestionIndex() + 1)
                    .totalQuestions(session.getTotalQuestions())
                    .build();
        } else {
            // Wrong answer - reinsert question after 2-3 questions
            log.debug("Câu trả lời sai, đưa câu hỏi {} vào lại sau", request.getQuestionId());
            reinsertQuestion(session, currentQuestion);

            return AnswerResponse.builder()
                    .correct(false)
                    .message("Sai rồi! Câu hỏi này sẽ xuất hiện lại sau.")
                    .nextQuestion(createQuizQuestionResponse(session.getQuestions().get(session.getCurrentQuestionIndex()), session))
                    .isCompleted(false)
                    .currentQuestionNumber(session.getCurrentQuestionIndex() + 1)
                    .totalQuestions(session.getTotalQuestions())
                    .build();
        }
    }
    
    @Override
    public QuizQuestionResponse getCurrentQuestion(String quizId, Integer userId) {
        log.info("Lấy câu hỏi hiện tại cho quiz {} của user ID: {}", quizId, userId);
        QuizSession session = getAndValidateSession(quizId, userId);

        if (session.getCurrentQuestionIndex() >= session.getTotalQuestions()) {
            log.warn("Quiz {} đã hoàn thành, không có câu hỏi hiện tại", quizId);
            throw new AppException(ErrorCode.INVALID_DATA, "Quiz đã hoàn thành");
        }

        QuizSession.QuizQuestion currentQuestion = session.getQuestions().get(session.getCurrentQuestionIndex());
        log.debug("Trả về câu hỏi hiện tại: {}", currentQuestion.getQuestionId());
        return createQuizQuestionResponse(currentQuestion, session);
    }

    @Override
    public void finishQuiz(String quizId, Integer userId) {
        log.info("Kết thúc quiz {} cho user ID: {}", quizId, userId);
        QuizSession session = getAndValidateSession(quizId, userId);
        quizSessions.remove(quizId);
        log.info("Quiz session {} đã được xóa khỏi bộ nhớ", quizId);
    }

    private void reinsertQuestion(QuizSession session, QuizSession.QuizQuestion question) {
        // Remove current question from its position
        session.getQuestions().remove(session.getCurrentQuestionIndex());

        // Calculate insertion position (after 2-3 questions)
        int insertPosition = Math.min(session.getCurrentQuestionIndex() + 2 + new Random().nextInt(2),
                                    session.getQuestions().size());

        // Insert question at new position
        session.getQuestions().add(insertPosition, question);

        // Reset question state
        question.setAnswered(false);
        log.debug("Đã đưa câu hỏi {} vào vị trí {}", question.getQuestionId(), insertPosition);
    }

    private QuizQuestionResponse createQuizQuestionResponse(QuizSession.QuizQuestion question, QuizSession session) {
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
    
    private QuizSession getAndValidateSession(String quizId, Integer userId) {
        log.debug("Validate quiz session {} cho user ID: {}", quizId, userId);
        QuizSession session = quizSessions.get(quizId);
        if (session == null) {
            log.warn("Quiz session {} không tồn tại", quizId);
            throw new AppException(ErrorCode.INVALID_DATA, "Quiz session không tồn tại");
        }
        if (!session.getUserId().equals(userId)) {
            log.warn("User ID {} không có quyền truy cập quiz session {}", userId, quizId);
            throw new AppException(ErrorCode.UNAUTHORIZED, "Bạn không có quyền truy cập quiz này");
        }
        return session;
    }
    
    private List<QuizSession.QuizQuestion> generateQuizQuestions(List<Vocabulary> vocabularies, int questionCount, Long seed) {
        log.debug("Tạo {} câu hỏi từ {} từ vựng", questionCount, vocabularies.size());
        // Random selection of vocabularies
        List<Vocabulary> selectedVocabularies = new ArrayList<>(vocabularies);
        if (seed != null) {
            Collections.shuffle(selectedVocabularies, new Random(seed));
            log.debug("Sử dụng seed {} để shuffle câu hỏi", seed);
        } else {
            Collections.shuffle(selectedVocabularies);
        }
        
        List<QuizSession.QuizQuestion> questions = selectedVocabularies.subList(0, questionCount)
                .stream()
                .map(this::createQuizQuestion)
                .collect(Collectors.toList());
        log.debug("Đã tạo thành công {} câu hỏi", questions.size());
        return questions;
    }
    
    private QuizSession.QuizQuestion createQuizQuestion(Vocabulary vocabulary) {
        String questionId = UUID.randomUUID().toString();
        String question = vocabulary.getTerm(); // Chỉ hiển thị từ tiếng Anh
        String correctAnswer = vocabulary.getVi();
        
        // Generate distractors (wrong options)
        List<String> options = generateDistractors(vocabulary, correctAnswer);
        options.add(correctAnswer);
        
        // Shuffle options
        Collections.shuffle(options);
        
        log.debug("Tạo câu hỏi: {} với {} lựa chọn", question, options.size());
        
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
        
        // Get other vocabularies from the same collection for distractors
        List<Vocabulary> otherVocabs = vocabularyRepository.findByCollectionId(currentVocab.getCollection().getId())
                .stream()
                .filter(v -> !v.getId().equals(currentVocab.getId()))
                .collect(Collectors.toList());
        
        // Try to find vocabularies with same part-of-speech first
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
        
        log.debug("Tạo {} lựa chọn sai cho từ {}", distractors.size(), currentVocab.getTerm());
        return distractors.subList(0, Math.min(3, distractors.size()));
    }
    
    private String generateSessionId() {
        return "quiz_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
