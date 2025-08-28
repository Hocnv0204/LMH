package com.lmh.web.controller.sse;

import com.lmh.web.exception.AppException;
import com.lmh.web.exception.ErrorCode;
import com.lmh.web.service.AuthenticationService;
import com.lmh.web.service.sse.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import com.lmh.web.configuration.CustomJwtDecoder;

@RestController
@RequestMapping("/sse")
@RequiredArgsConstructor
public class SseController {

    private final SseService sseService;
    private final AuthenticationService authenticationService;
    private final CustomJwtDecoder jwtDecoder;

    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(
            @RequestParam() String token
    ) {
        Jwt jwtPrincipal = jwtDecoder.decode(token);
        Long userIdLong = jwtPrincipal.getClaim("id");
        Integer userId;
        try {
            userId = Math.toIntExact(userIdLong);
        } catch (ArithmeticException e) {
            throw new IllegalArgumentException("User ID from token is too large.", e);
        }
        verifyUser(token, userId);
        return sseService.createEmitter(userId);
    }

    private void verifyUser(String token, int userIdFromRequest) {

        // Gọi service để xác thực
        boolean isValid = authenticationService.verifyUserIdentity(token, userIdFromRequest);
        if (!isValid) {
            // Nếu không hợp lệ, ném lỗi Unauthorized (401)
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }
}