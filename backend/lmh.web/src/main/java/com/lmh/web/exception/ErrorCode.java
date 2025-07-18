package com.lmh.web.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;
@AllArgsConstructor
@Getter
public enum ErrorCode {
    WORD_EXISTS(1000 , "Word already exists" , HttpStatus.BAD_REQUEST) ,
    WORD_INVALID(1001 , "Word is invalid" , HttpStatus.BAD_REQUEST) ,
    WORD_IS_NOT_EXISTS(1002 , "Word is not exists" , HttpStatus.BAD_REQUEST) ,
    COLLECTION_IS_NOT_EXISTS(1003 , "Collection is not exists" , HttpStatus.BAD_REQUEST) ,
    IMAGE_UPLOAD_FAILED(1004 , "Image upload failed" , HttpStatus.INTERNAL_SERVER_ERROR) ,
    FLASHCARD_NOT_FOUND(1005 , "Flashcard not found" , HttpStatus.NOT_FOUND) ,
    DELETE_FAILED(1006 , "Delete failed" , HttpStatus.INTERNAL_SERVER_ERROR)  ;


    private final int code ;
    private final String message ;
    private HttpStatus status ;
}
