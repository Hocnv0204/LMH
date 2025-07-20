package com.lmh.web.service.cloudinary;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public Map<String, String> uploadFile(MultipartFile file) throws IOException {
        // 1. Upload file lên Cloudinary và nhận kết quả (dạng Map<String, Object>)
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), Map.of());

        // 2. Tạo một Map mới để trả về, đảm bảo kiểu là <String, String>
        Map<String, String> result = new HashMap<>();

        // 3. Lấy các giá trị cần thiết và đặt vào map mới
        // Ép kiểu (cast) giá trị từ Object về String
        String url = (String) uploadResult.get("url");
        String publicId = (String) uploadResult.get("public_id");

        result.put("url", url);
        result.put("public_id", publicId);

        // 4. Trả về map kết quả đã được đơn giản hóa
        return result;
    }

    @Override
    public void deleteFile(String publicId) throws IOException {
        cloudinary.uploader().destroy(publicId, Map.of());
    }
}
