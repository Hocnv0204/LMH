package com.lmh.web.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.lmh.web.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileStorageServiceImpl implements FileStorageService {
    private final Cloudinary cloudinary ;
    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        try {
            // Chuẩn bị tham số upload, thêm subDirectory nếu có
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", subDirectory != null && !subDirectory.isEmpty() ? subDirectory : null
            );
            Map result = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public void deleteFile(String fileUrl , String subDirectory){
        if(fileUrl == null || fileUrl.isEmpty()){
            return ;
        }
        try{
            String publicId = extractPublicIdFromUrl(fileUrl , subDirectory) ;
            Map result = cloudinary.uploader().destroy(publicId , ObjectUtils.emptyMap()) ;
        }catch (IOException e ){
            throw new RuntimeException("Failed to delete file" , e) ;
        }catch (IllegalArgumentException e){
            throw new RuntimeException("Error parsing Cloudinary URL" , e) ;
        }
    }

    @Override
    public String getFileUrl(String fileName, String subDirectory) {
        // Tạo URL từ fileName và subDirectory theo cấu trúc Cloudinary
        String cloudName = cloudinary.config.cloudName;
        String baseUrl = "https://res.cloudinary.com/" + cloudName + "/image/upload/";
        String folder = (subDirectory != null && !subDirectory.isEmpty()) ? subDirectory + "/" : "";
        return baseUrl + folder + fileName;
    }

    private String extractPublicIdFromUrl(String fileUrl, String subDirectory) {
        int uploadIndex = fileUrl.indexOf("/upload/");
        if (uploadIndex == -1) {
            throw new IllegalArgumentException("Invalid Cloudinary URL format: missing '/upload/' segment. URL: " + fileUrl);
        }

        String pathSegment = fileUrl.substring(uploadIndex + "/upload/".length());

        // Bỏ qua version (bắt đầu bằng 'v' và theo sau bởi '/')
        if (pathSegment.startsWith("v") && pathSegment.contains("/")) {
            int firstSlashAfterVersion = pathSegment.indexOf('/');
            if (firstSlashAfterVersion != -1) {
                pathSegment = pathSegment.substring(firstSlashAfterVersion + 1);
            } else {
                throw new IllegalArgumentException("Invalid Cloudinary URL format: version segment not followed by path in " + fileUrl);
            }
        }

        // Loại bỏ phần extension (nếu có)
        int lastDotIndex = pathSegment.lastIndexOf(".");
        String publicId = lastDotIndex != -1 ? pathSegment.substring(0, lastDotIndex) : pathSegment;

        // Kiểm tra subDirectory (nếu có)
        if (subDirectory != null && !subDirectory.isEmpty() && !publicId.startsWith(subDirectory + "/")) {
            System.out.println("Warning: Public ID does not match expected subDirectory. Public ID: " + publicId + ", Expected subDirectory: " + subDirectory + ". URL: " + fileUrl);
        }

        return publicId;
    }
}
