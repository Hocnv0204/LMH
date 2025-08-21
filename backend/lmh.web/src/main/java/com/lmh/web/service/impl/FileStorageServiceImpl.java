package com.lmh.web.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lmh.web.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {
    private final Cloudinary cloudinary ;
    
    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        log.info("Bắt đầu upload file: {} vào thư mục: {}", file.getOriginalFilename(), subDirectory);
        try {
            // Chuẩn bị tham số upload, thêm subDirectory nếu có
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", subDirectory != null && !subDirectory.isEmpty() ? subDirectory : null
            );
            Map result = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String fileUrl = result.get("secure_url").toString();
            log.info("Upload file thành công: {} -> {}", file.getOriginalFilename(), fileUrl);
            return fileUrl;
        } catch (IOException e) {
            log.error("Upload file thất bại: {}, thư mục: {}", file.getOriginalFilename(), subDirectory, e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl , String subDirectory){
        if(fileUrl == null || fileUrl.isEmpty()){
            log.debug("File URL rỗng, bỏ qua việc xóa");
            return ;
        }
        log.info("Bắt đầu xóa file: {} từ thư mục: {}", fileUrl, subDirectory);
        try{
            String publicId = extractPublicIdFromUrl(fileUrl , subDirectory) ;
            Map result = cloudinary.uploader().destroy(publicId , ObjectUtils.emptyMap()) ;
            log.info("Xóa file thành công: {}, publicId: {}", fileUrl, publicId);
        }catch (IOException e ){
            log.error("Xóa file thất bại: {}, thư mục: {}", fileUrl, subDirectory, e);
            throw new RuntimeException("Failed to delete file" , e) ;
        }catch (IllegalArgumentException e){
            log.error("Lỗi parse Cloudinary URL: {}", fileUrl, e);
            throw new RuntimeException("Error parsing Cloudinary URL" , e) ;
        }
    }

    @Override
    public String getFileUrl(String fileName, String subDirectory) {
        log.debug("Tạo file URL cho: {} trong thư mục: {}", fileName, subDirectory);
        // Tạo URL từ fileName và subDirectory theo cấu trúc Cloudinary
        String cloudName = cloudinary.config.cloudName;
        String baseUrl = "https://res.cloudinary.com/" + cloudName + "/image/upload/";
        String folder = (subDirectory != null && !subDirectory.isEmpty()) ? subDirectory + "/" : "";
        String fileUrl = baseUrl + folder + fileName;
        log.debug("Tạo file URL thành công: {}", fileUrl);
        return fileUrl;
    }

    private String extractPublicIdFromUrl(String fileUrl, String subDirectory) {
        log.debug("Extract public ID từ URL: {}", fileUrl);
        int uploadIndex = fileUrl.indexOf("/upload/");
        if (uploadIndex == -1) {
            log.error("URL Cloudinary không hợp lệ, thiếu '/upload/': {}", fileUrl);
            throw new IllegalArgumentException("Invalid Cloudinary URL format: missing '/upload/' segment. URL: " + fileUrl);
        }

        String pathSegment = fileUrl.substring(uploadIndex + "/upload/".length());

        // Bỏ qua version (bắt đầu bằng 'v' và theo sau bởi '/')
        if (pathSegment.startsWith("v") && pathSegment.contains("/")) {
            int firstSlashAfterVersion = pathSegment.indexOf('/');
            if (firstSlashAfterVersion != -1) {
                pathSegment = pathSegment.substring(firstSlashAfterVersion + 1);
            } else {
                log.error("URL Cloudinary không hợp lệ, version segment không được theo sau bởi path: {}", fileUrl);
                throw new IllegalArgumentException("Invalid Cloudinary URL format: version segment not followed by path in " + fileUrl);
            }
        }

        // Loại bỏ phần extension (nếu có)
        int lastDotIndex = pathSegment.lastIndexOf(".");
        String publicId = lastDotIndex != -1 ? pathSegment.substring(0, lastDotIndex) : pathSegment;

        // Kiểm tra subDirectory (nếu có)
        if (subDirectory != null && !subDirectory.isEmpty() && !publicId.startsWith(subDirectory + "/")) {
            log.warn("Public ID không khớp với subDirectory mong đợi. Public ID: {}, Expected subDirectory: {}, URL: {}", 
                    publicId, subDirectory, fileUrl);
        }

        log.debug("Extracted public ID: {} từ URL: {}", publicId, fileUrl);
        return publicId;
    }
}
