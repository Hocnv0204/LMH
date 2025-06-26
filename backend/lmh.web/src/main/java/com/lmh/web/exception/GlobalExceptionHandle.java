package com.lmh.web.exception;

import com.lmh.web.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandle {
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex){
        ApiResponse<Void> response = new ApiResponse<>(ex.getErrorCode()) ;
        return new ResponseEntity<>(response , ex.getErrorCode().getStatus()) ;
    }
}

