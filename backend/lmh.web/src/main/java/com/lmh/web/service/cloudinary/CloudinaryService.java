package com.lmh.web.service.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Service for handling Cloudinary image operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    /**
     * Initialize Cloudinary instance
     */
    private Cloudinary getCloudinary() {
        if (cloudinary == null) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            ));
        }
        return cloudinary;
    }

    /**
     * Upload image to Cloudinary
     * @param file MultipartFile to upload
     * @return Map containing secure_url and public_id
     * @throws IOException if upload fails
     */
    public Map<String, String> uploadImage(MultipartFile file) throws IOException {
        log.info("Uploading image to Cloudinary: {}", file.getOriginalFilename());

        Map<String, Object> uploadResult = getCloudinary().uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", "topics",
                        "resource_type", "image"
                )
        );

        String secureUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        log.info("Image uploaded successfully. Public ID: {}, URL: {}", publicId, secureUrl);

        return Map.of(
                "secure_url", secureUrl,
                "public_id", publicId
        );
    }

    /**
     * Delete image from Cloudinary
     * @param publicId Public ID of the image to delete
     * @throws IOException if deletion fails
     */
    public void deleteImage(String publicId) throws IOException {
        if (publicId == null || publicId.trim().isEmpty()) {
            log.warn("Cannot delete image: public_id is null or empty");
            return;
        }

        log.info("Deleting image from Cloudinary: {}", publicId);

        Map<String, Object> deleteResult = getCloudinary().uploader().destroy(
                publicId,
                ObjectUtils.emptyMap()
        );

        log.info("Image deletion result: {}", deleteResult);
    }
}

