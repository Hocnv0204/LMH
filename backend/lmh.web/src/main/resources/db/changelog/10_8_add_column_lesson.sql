-- Thêm cột language_id kiểu INTEGER nếu cột này chưa tồn tại trong bảng lesson
ALTER TABLE public.lesson
    ADD COLUMN IF NOT EXISTS language_id INTEGER;

-- Thêm cột level_id kiểu INTEGER nếu cột này chưa tồn tại trong bảng lesson
ALTER TABLE public.lesson
    ADD COLUMN IF NOT EXISTS level_id INTEGER;