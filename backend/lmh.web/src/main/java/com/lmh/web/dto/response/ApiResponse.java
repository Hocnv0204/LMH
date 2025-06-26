package com.lmh.web.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lmh.web.exception.ErrorCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@AllArgsConstructor
public class ApiResponse <T>{
    private ApiError error ;
    private boolean success ;
    private T data ;



    public ApiResponse(T data ){
        this.success = true ;
        this.data = data ;
    }
    public ApiResponse(ErrorCode errorCode){
        this.success = false ;
        this.error = new ApiError(errorCode) ;
    }
}
