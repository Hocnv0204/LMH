--liquibase formatted sql

-- Thêm cột vào bảng "topic" nếu chưa tồn tại
ALTER TABLE "topic"
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS image_id VARCHAR(255);