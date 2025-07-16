package com.lmh.web.dto.response.user;

import com.lmh.web.common.Role;
import lombok.Data;

@Data
public class UserDto {
    private Integer id;
    private String username;
    private String email;
    private Role role;
}
