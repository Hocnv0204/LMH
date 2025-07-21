-- =============================================================================
-- LMH Web Application Database Schema
-- Description: Tạo các bảng cơ sở dữ liệu cho ứng dụng học ngoại ngữ LMH
-- =============================================================================

-- 1. Bảng Language - Quản lý các ngôn ngữ
CREATE TABLE IF NOT EXISTS language (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    note TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    delete_flag BOOLEAN DEFAULT FALSE
);

-- 2. Bảng Level - Quản lý các cấp độ học
CREATE TABLE IF NOT EXISTS level (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    delete_flag BOOLEAN DEFAULT FALSE,
    language_id INTEGER,
    FOREIGN KEY (language_id) REFERENCES language(id)
);

-- 3. Bảng Users - Quản lý người dùng
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    username VARCHAR(100) UNIQUE,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    date_birth DATE,
    school VARCHAR(100),
    password VARCHAR(255),
    role VARCHAR(50),
    point INTEGER,
    credit INTEGER,
    created_at TIMESTAMP,
    last_login TIMESTAMP,
    delete_flag BOOLEAN DEFAULT FALSE
);

-- 4. Bảng Topic - Quản lý chủ đề học tập
CREATE TABLE IF NOT EXISTS topic (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    delete_flag BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) CHECK (type IN ('USER_CREATION', 'DEFAULT')),
    note TEXT,
    created_at TIMESTAMP,
    image_url VARCHAR(500),
    image_id VARCHAR(255),
    user_id INTEGER,
    language_id INTEGER,
    level_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (language_id) REFERENCES language(id),
    FOREIGN KEY (level_id) REFERENCES level(id)
);

-- 5. Bảng Lesson - Quản lý bài học
CREATE TABLE IF NOT EXISTS lesson (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    paragraph TEXT,
    note TEXT,
    description TEXT,
    status VARCHAR(50),
    delete_flag BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) CHECK (type IN ('USER_CREATION', 'DEFAULT')),
    last_practice TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    topic_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (topic_id) REFERENCES topic(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 6. Bảng Status Lesson - Quản lý trạng thái bài học
CREATE TABLE IF NOT EXISTS status_lesson (
    id SERIAL PRIMARY KEY,
    name_status VARCHAR(20)
);

-- 7. Bảng Status Lesson User - Quản lý trạng thái bài học của người dùng
-- Lưu ý: Tên bảng có typo "leson" như trong entity
CREATE TABLE IF NOT EXISTS status_leson_user (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    lesson_id INTEGER,
    status INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lesson(id),
    FOREIGN KEY (status) REFERENCES status_lesson(id)
);

-- 8. Bảng Suggest Vocabulary - Quản lý từ vựng gợi ý
CREATE TABLE IF NOT EXISTS suggest_vocabulary (
    id SERIAL PRIMARY KEY,
    term VARCHAR(100),
    vietnamese TEXT,
    type VARCHAR(50),
    pronunciation VARCHAR(100),
    example TEXT,
    delete_flag BOOLEAN DEFAULT FALSE,
    lesson_id INTEGER,
    FOREIGN KEY (lesson_id) REFERENCES lesson(id)
);

-- 9. Bảng History - Quản lý lịch sử học tập
CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    question TEXT,
    answer TEXT,
    result VARCHAR(50),
    user_id INTEGER,
    lesson_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (lesson_id) REFERENCES lesson(id)
);

-- 10. Bảng Collection Vocabulary - Quản lý bộ sưu tập từ vựng
CREATE TABLE IF NOT EXISTS collectionvoca (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- 11. Bảng Vocabulary - Quản lý từ vựng
CREATE TABLE IF NOT EXISTS vocabulary (
    id SERIAL PRIMARY KEY,
    term VARCHAR(100),
    vi TEXT,
    type VARCHAR(50),
    pronunciation VARCHAR(100),
    example TEXT,
    audio_url VARCHAR(500),
    collection_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (collection_id) REFERENCES collectionvoca(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 12. Bảng Flash Card - Quản lý thẻ học
CREATE TABLE IF NOT EXISTS flash_card (
    id SERIAL PRIMARY KEY,
    image_url VARCHAR(500),
    vocab_id INTEGER,
    FOREIGN KEY (vocab_id) REFERENCES vocabulary(id)
);

-- 13. Bảng Notification - Quản lý thông báo
CREATE TABLE IF NOT EXISTS notification (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50),
    message TEXT,
    link VARCHAR(255),
    created_at TIMESTAMP,
    is_read BOOLEAN DEFAULT FALSE,
    user_sender INTEGER,
    user_receive INTEGER,
    FOREIGN KEY (user_sender) REFERENCES users(id),
    FOREIGN KEY (user_receive) REFERENCES users(id)
);

-- 14. Bảng Payment - Quản lý thanh toán
CREATE TABLE IF NOT EXISTS payment (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP,
    price DECIMAL(10,2),
    status VARCHAR(50),
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 15. Bảng Feedback - Quản lý phản hồi
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    description TEXT,
    created_at TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

