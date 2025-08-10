package com.lmh.web.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.Collection;

@AllArgsConstructor
@Getter
public enum ErrorCode {
    WORD_EXISTS(1000 , "Word already exists" , HttpStatus.BAD_REQUEST) ,
    WORD_INVALID(1001 , "Word is invalid" , HttpStatus.BAD_REQUEST) ,
    WORD_IS_NOT_EXISTS(1002 , "Word is not exists" , HttpStatus.BAD_REQUEST) ,
    COLLECTION_IS_NOT_EXISTS(1003 , "Collection is not exists" , HttpStatus.BAD_REQUEST) ,
    IMAGE_UPLOAD_FAILED(1004 , "Image upload failed" , HttpStatus.INTERNAL_SERVER_ERROR) ,
    FLASHCARD_NOT_FOUND(1005 , "Flashcard not found" , HttpStatus.NOT_FOUND) ,
    DELETE_FAILED(1006 , "Delete failed" , HttpStatus.INTERNAL_SERVER_ERROR)  ,
    USER_NOT_EXISTS(1007,"User is not exists" , HttpStatus.NOT_FOUND) ,

    UNAUTHORIZED(1008 , "Username or password is invalid" , HttpStatus.UNAUTHORIZED) ,
    EMAIL_EXISTS(1009 , "Email already exists" , HttpStatus.BAD_REQUEST) ,
    USERNAME_EXISTS(1010 , "Username already exists" , HttpStatus.BAD_REQUEST) ,
    TOKEN_INVALID(1011 , "Token is invalid" , HttpStatus.BAD_REQUEST)  ,
    TOKEN_EXPIRED(1012 , "Token is expired" , HttpStatus.BAD_REQUEST) ,
    TOKEN_EXISTS(1013 , "Token already exists" , HttpStatus.BAD_REQUEST),
    TOKEN_NOT_EXISTS(1014 , "Token is not exists" , HttpStatus.BAD_REQUEST) ,
    USER_ENABLED(1015 , "User already enabled" , HttpStatus.BAD_REQUEST) ,
    EMAIL_NOT_EXISTS(1016 , "Email is not exists" , HttpStatus.BAD_REQUEST) ,
    COLLECTION_EXISTS(1017 , "Collection is exists" , HttpStatus.BAD_REQUEST) ,
    INVALID_DATA(1018 , "Invalid data" , HttpStatus.BAD_REQUEST) ;



    private final int code ;
    private final String message ;
    private HttpStatus status ;
}
