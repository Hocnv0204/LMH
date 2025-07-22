--liquibase formatted sql

--changeset Hoc:002_add_enable_and_create_verification_token

-- Thêm cột 'enable' vào bảng 'users'
ALTER TABLE users ADD COLUMN enable BOOLEAN DEFAULT FALSE;

-- Tạo bảng 'verification_token'
CREATE TABLE verification_token (
                                    id SERIAL PRIMARY KEY ,
                                    user_id INT NOT NULL,
                                    token VARCHAR(255),
                                    expired_time TIMESTAMP,
                                    token_type VARCHAR(50),
                                    CONSTRAINT fk_user_verification FOREIGN KEY (user_id) REFERENCES users(id)
);
ALTER TABLE verification_token
    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

