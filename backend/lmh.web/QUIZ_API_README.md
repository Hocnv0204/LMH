# Quiz API Documentation

## Overview

API luyện trắc nghiệm từ vocab thuộc các collection của user. Mỗi câu hỏi là trắc nghiệm với:

- **Câu hỏi**: Từ tiếng Anh (term)
- **Đáp án**: 4 lựa chọn tiếng Việt (vi) từ database
- **Hiển thị**: Lần lượt từng câu hỏi thay vì hiển thị toàn bộ

## Features

- Trả lời đúng → chuyển câu tiếp theo
- Trả lời sai → bắt buộc làm lại câu đó đến khi đúng (không giới hạn số lần)
- Không lưu kết quả, không tính thời gian
- Phiên làm bài chỉ là tạm thời (ephemeral)
- Xáo trộn thứ tự đáp án và câu hỏi (deterministic nếu client gửi seed)

## Endpoints

### 1. Start Quiz

**POST** `/api/quiz/start`

**Request Body:**

```json
{
  "collectionId": 1,
  "totalQuestions": 10,
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

### 2. Get Current Question

**GET** `/api/quiz/question?sessionId={sessionId}`

**Response:**

```json
{
  "success": true,
  "data": {
    "questionId": "uuid-123",
    "question": "hello",
    "options": ["Xin chào", "Tạm biệt", "Cảm ơn", "Không xác định"],
    "correctAnswer": null,
    "isCorrect": false,
    "message": "Câu hỏi hiện tại",
    "isCompleted": false,
    "currentQuestionNumber": 1,
    "totalQuestions": 10
  }
}
```

### 3. Answer Question

**POST** `/api/quiz/answer?sessionId={sessionId}`

**Request Body:**

```json
{
  "questionId": "uuid-123",
  "answer": "Xin chào"
}
```

**Response (Correct Answer):**

```json
{
  "success": true,
  "data": {
    "questionId": "uuid-123",
    "question": "hello",
    "options": ["Xin chào", "Tạm biệt", "Cảm ơn", "Không xác định"],
    "correctAnswer": "Xin chào",
    "isCorrect": true,
    "message": "Chính xác! Chuyển sang câu hỏi tiếp theo.",
    "isCompleted": false,
    "currentQuestionNumber": 2,
    "totalQuestions": 10
  }
}
```

**Response (Wrong Answer):**

```json
{
  "success": true,
  "data": {
    "questionId": "uuid-123",
    "question": "hello",
    "options": ["Xin chào", "Tạm biệt", "Cảm ơn", "Không xác định"],
    "correctAnswer": null,
    "isCorrect": false,
    "message": "Sai rồi! Hãy thử lại.",
    "isCompleted": false,
    "currentQuestionNumber": 1,
    "totalQuestions": 10
  }
}
```

### 4. End Quiz

**POST** `/api/quiz/end?sessionId={sessionId}`

**Response:**

```json
{
  "success": true,
  "data": "Quiz đã kết thúc thành công"
}
```

## Headers

- `User-Id`: ID của user đang làm bài (required)

## Business Rules

1. **Question Generation**: Mỗi câu hỏi hiển thị từ tiếng Anh (term) từ vocab trong collection
2. **Answer Options**: 4 đáp án tiếng Việt (vi), trong đó 1 đúng và 3 nhiễu
3. **Distractor Generation**: Đáp án nhiễu được lấy từ vocab trong cùng collection, ưu tiên cùng part-of-speech
4. **Progress Tracking**: Chỉ chuyển câu hỏi khi trả lời đúng
5. **Session Management**: Quiz sessions được lưu trong memory và tự động cleanup sau 2 giờ
6. **No Persistence**: Không lưu kết quả vào database
7. **Sequential Display**: Hiển thị lần lượt từng câu hỏi thay vì hiển thị toàn bộ

## Error Handling

- `COLLECTION_IS_NOT_EXISTS`: Collection không tồn tại
- `INVALID_DATA`: Dữ liệu không hợp lệ (không đủ vocab, session không tồn tại)
- `UNAUTHORIZED`: Không có quyền truy cập session

## Performance Considerations

- Sử dụng in-memory storage cho quiz sessions
- Batch fetch vocabularies từ collection với limit 20 để có đa dạng đáp án nhiễu
- Scheduled cleanup để tránh memory leak
- Deterministic shuffling với seed để tái tạo kết quả nếu cần
- Tối ưu query với `ORDER BY RAND()` và `Pageable` để lấy vocab ngẫu nhiên
