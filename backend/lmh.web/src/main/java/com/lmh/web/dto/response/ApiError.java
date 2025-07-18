package com.lmh.web.dto.response;

import com.lmh.web.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
@Getter
@Setter
public class ApiError {
    private int  code ;
    private String message ;
    private HttpStatus status ;

    public ApiError (ErrorCode errorCode){
        this.code = errorCode.getCode() ;
        this.message = errorCode.getMessage() ;
        this.status = errorCode.getStatus() ;
    }
}
