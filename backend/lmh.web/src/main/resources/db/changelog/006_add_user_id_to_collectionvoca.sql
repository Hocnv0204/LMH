ALTER TABLE collectionvoca
    ADD COLUMN IF NOT EXISTS user_id INTEGER;

ALTER TABLE collectionvoca
DROP CONSTRAINT IF EXISTS fk_collectionvoca_user;
-- Nếu muốn ràng buộc khóa ngoại tới bảng users (giả sử tên bảng là "users" và cột id là BIGINT)
ALTER TABLE collectionvoca
    ADD CONSTRAINT fk_collectionvoca_user
        FOREIGN KEY (user_id)
            REFERENCES users (id) ;
ALTER TABLE vocabulary
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255)