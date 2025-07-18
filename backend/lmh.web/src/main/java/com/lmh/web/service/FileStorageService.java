package com.lmh.web.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile multipartFile , String subDirectory ) throws Exception ;
    void deleteFile(String fileName , String subDirectory) throws Exception ;
    String getFileUrl(String fileName , String subDirectory) ;
}
