# Quiz API - Module Trắc Nghiệm Từ Vựng

## Mô tả chức năng

Module trắc nghiệm từ vựng tiếng Anh sang tiếng Việt với các tính năng:

- Mỗi câu hỏi là một từ tiếng Anh
- Câu trả lời là từ tiếng Việt
- Người dùng chọn collection và số lượng câu hỏi
- Hệ thống chọn ngẫu nhiên các từ thuộc collection
- Mỗi câu hỏi có 1 đáp án đúng và 3 đáp án sai
- Logic xử lý hàng đợi câu hỏi thông minh

## API Endpoints

### 1. Bắt đầu Quiz

**POST** `/api/quiz/start?userId={userId}`

**Request Body:**

```json
{
  "collectionId": 1,
  "questionCount": 10,
  "seed": 12345
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "quiz_abc123def456",
    "collectionId": 1,
    "totalQuestions": 10,
    "currentQuestionNumber": 1,
    "message": "Quiz đã bắt đầu thành công"
  }
}
```

### 2. Trả lời câu hỏi

**POST** `/api/quiz/answer?userId={userId}`

**Request Body:**

```json
{
  "quizId": "quiz_abc123def456",
  "questionId": "question_uuid",
  "selectedAnswer": "Đáp án người dùng chọn"
}
```

**Response khi đúng:**

```json
{
  "success": true,
  "data": {
    "correct": true,
    "message": "Chính xác! Chuyển sang câu hỏi tiếp theo.",
    "nextQuestion": {
      "questionId": "next_question_uuid",
      "question": "Từ tiếng Anh tiếp theo",
      "options": ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"],
      "correctAnswer": null,
      "isCorrect": false,
      "message": "Câu hỏi hiện tại",
      "isCompleted": false,
      "currentQuestionNumber": 2,
      "totalQuestions": 10
    },
    "isCompleted": false,
    "currentQuestionNumber": 2,
    "totalQuestions": 10
  }
}
```

**Response khi sai:**

```json
{
  "success": true,
  "data": {
    "correct": false,
    "message": "Sai rồi! Câu hỏi này sẽ xuất hiện lại sau.",
    "nextQuestion": {
      "questionId": "next_question_uuid",
      "question": "Từ tiếng Anh tiếp theo",
      "options": ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"],
      "correctAnswer": null,
      "isCorrect": false,
      "message": "Câu hỏi hiện tại",
      "isCompleted": false,
      "currentQuestionNumber": 2,
      "totalQuestions": 10
    },
    "isCompleted": false,
    "currentQuestionNumber": 2,
    "totalQuestions": 10
  }
}
```

### 3. Lấy câu hỏi hiện tại

**GET** `/api/quiz/question?quizId={quizId}&userId={userId}`

**Response:**

```json
{
  "success": true,
  "data": {
    "questionId": "question_uuid",
    "question": "Từ tiếng Anh",
    "options": ["Đáp án 1", "Đáp án 2", "Đáp án 3", "Đáp án 4"],
    "correctAnswer": null,
    "isCorrect": false,
    "message": "Câu hỏi hiện tại",
    "isCompleted": false,
    "currentQuestionNumber": 1,
    "totalQuestions": 10
  }
}
```

### 4. Kết thúc Quiz

**POST** `/api/quiz/finish?quizId={quizId}&userId={userId}`

**Response:**

```json
{
  "success": true,
  "data": "Quiz đã kết thúc thành công"
}
```

## Logic xử lý hàng đợi câu hỏi

### Khi trả lời đúng:

- Câu hỏi được đánh dấu là đã trả lời
- Chuyển sang câu hỏi tiếp theo
- Câu hỏi đã trả lời không xuất hiện lại

### Khi trả lời sai:

- Câu hỏi được chèn lại vào hàng đợi
- Vị trí chèn: sau 2-3 câu hỏi (random)
- Câu hỏi sẽ xuất hiện lại để người dùng thử lại

## Cấu trúc dữ liệu

### QuizSession

```java
public class QuizSession {
    private String sessionId;
    private Integer userId;
    private Integer collectionId;
    private Integer totalQuestions;
    private Integer currentQuestionIndex;
    private List<QuizQuestion> questions;
    private Map<String, Integer> questionAttempts;
    private LocalDateTime createdAt;
    private LocalDateTime lastActivityAt;
}
```

### QuizQuestion

```java
public static class QuizQuestion {
    private String questionId;
    private Integer vocabularyId;
    private String question;        // Từ tiếng Anh
    private String correctAnswer;   // Nghĩa tiếng Việt đúng
    private List<String> options;   // 4 đáp án (1 đúng + 3 sai)
    private boolean isAnswered;
}
```

## Lưu ý

1. **Session Management**: Quiz session được lưu trong memory (ConcurrentHashMap). Có thể nâng cấp lên Redis để hỗ trợ scale.

2. **Security**: Mỗi user chỉ có thể truy cập quiz session của mình thông qua parameter `userId`.

3. **Performance**: Sử dụng `findByCollectionId` để lấy từ vựng, có thể tối ưu thêm với pagination nếu collection lớn.

4. **Randomization**: Hỗ trợ seed để đảm bảo tính nhất quán khi cần thiết.

5. **Cleanup**: Session tự động được xóa khi kết thúc quiz hoặc có thể thêm cleanup job định kỳ.

6. **API Usage**: `userId` được truyền qua query parameter thay vì header, giúp dễ test và sử dụng hơn.
