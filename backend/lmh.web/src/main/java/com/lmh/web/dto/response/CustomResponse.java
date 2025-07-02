package com.lmh.web.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.io.Serializable;

@Getter
@Setter
@JsonPropertyOrder({"data", "message"})
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomResponse<T> implements Serializable {
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private T data;

    private String message;

    private HttpStatus httpStatus;

    public CustomResponse(T data, String message){
        this.data = data;
        this.message = message;
    }

    public CustomResponse(T data, HttpStatus httpStatus){
        this.data = data;
        this.httpStatus = httpStatus;
    }

    public CustomResponse(String message){
        this.message = message;
    }

    public CustomResponse(T data){
        this.data = data;
    }
}
