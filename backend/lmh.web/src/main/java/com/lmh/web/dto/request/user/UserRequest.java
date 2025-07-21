package com.lmh.web.dto.request.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    private Integer id;
    private String name;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String school;
}
