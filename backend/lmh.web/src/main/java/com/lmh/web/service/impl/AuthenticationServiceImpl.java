package com.lmh.web.service.impl;


import com.lmh.web.common.Role;
import com.lmh.web.common.constant.TypeToken;
import com.lmh.web.dto.request.authentication.*;

import com.lmh.web.dto.request.authentication.IntrospectRequest;
import com.lmh.web.dto.request.authentication.LoginRequest;
import com.lmh.web.dto.request.authentication.LogoutRequest;
import com.lmh.web.dto.request.authentication.RefreshTokenRequest;

import com.lmh.web.dto.response.AuthenticationResponse;
import com.lmh.web.dto.response.user.IntrospectResponse;
import com.lmh.web.exception.AppException;
import com.lmh.web.exception.ErrorCode;
import com.lmh.web.model.InvalidToken;
import com.lmh.web.model.User;

import com.lmh.web.model.VerificationToken;
import com.lmh.web.repository.InvalidTokenRepository;
import com.lmh.web.repository.UserRepository;
import com.lmh.web.repository.VerificationTokenRepository;
import com.lmh.web.service.AuthenticationService;
import com.lmh.web.service.EmailService;

import com.lmh.web.repository.InvalidTokenRepository;
import com.lmh.web.repository.UserRepository;
import com.lmh.web.service.AuthenticationService;

import com.lmh.web.service.RedisService;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import io.jsonwebtoken.JwsHeader;
import lombok.RequiredArgsConstructor;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;

import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Objects;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    @Value("${jwt.refreshable-duration}")
    private int REFRESHABLE_DURATION;
    @Value("${jwt.valid-duration}")
    private int VALID_DURATION;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final InvalidTokenRepository invalidTokenRepository;

    private final RedisService redisService ;


    private final EmailService emailService ;

    private final VerificationTokenRepository verificationTokenRepository ;

    private final Integer INIT_CREDIT = 10;


    @Override
    public AuthenticationResponse login(LoginRequest request) {
        User user = new User() ;
        if(request.getUsername().contains("@")){
            user = userRepository.findByEmailIgnoreCase(request.getUsername()).orElseThrow(
                    () -> new AppException(ErrorCode.USER_NOT_EXISTS)
            ) ;
        }
        else {
            user = userRepository.findByUsername(request.getUsername()).orElseThrow(
                    () -> new AppException(ErrorCode.USER_NOT_EXISTS)
            );
        }

        if(!user.isEnable()){
            throw new AppException(ErrorCode.UNAUTHORIZED) ;
        }
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        var accessToken = generateAccessToken(user) ;
        var refreshToken = generateRefreshToken(user) ;
        redisService.savedRefreshToken(user.getId() , refreshToken);
        return AuthenticationResponse.builder()
                .authenticated(authenticated)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private SignedJWT verifiedToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY);
        SignedJWT signedJWT = SignedJWT.parse(token);
        var verified = signedJWT.verify(verifier);
        Date expiryTime = (isRefresh)
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime()
                .toInstant().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli())
                :
                signedJWT.getJWTClaimsSet().getExpirationTime();
        if (!(verified && expiryTime.after(new Date()))) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (invalidTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return signedJWT;
    }
    @Override
    public String generateRefreshToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("LMH")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", user.getRole())
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(jwsHeader, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return jwsObject.serialize();
    }
    @Override
    public String generateAccessToken(User user) {
        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);
        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername() != null && !user.getUsername().isEmpty() ? user.getUsername() : "student")
                .issuer("LMH")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", user.getRole())
                .claim("id" , user.getId())
                .claim("fullName" , (user.getName() != null && !user.getName().isEmpty()) ? user.getName() : "Student")
                .claim("email" , user.getEmail())
                .build();
        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(jwsHeader, payload);
        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return jwsObject.serialize();
    }

    @Override
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean valid = true;
        try {
            verifiedToken(token, false);
        } catch (AppException e) {
            log.error("Token introspection failed: {}", e.getMessage(), e);
            valid = false;
        }
        return IntrospectResponse.builder()
                .valid(valid)
                .build();
    }

    @Override
    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        var token = request.getToken();
        SignedJWT signedJWT = verifiedToken(token, true);
        var user = userRepository.findByUsername(signedJWT.getJWTClaimsSet().getSubject()).orElseThrow(
                () -> new AppException(ErrorCode.UNAUTHORIZED)
        );
        redisService.deleteRefreshToken(user.getId());
        String jit = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
        invalidTokenRepository.save(
                InvalidToken.builder()
                        .expiryTime(expiryTime)
                        .id(jit)
                        .build()
        );
    }


@Override
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) throws ParseException, JOSEException {
        var token = request.getRefreshToken() ;
        SignedJWT signedJWT = verifiedToken(token , true) ;
        var user = userRepository.findById(request.getUserId()).orElseThrow(
                () -> new AppException(ErrorCode.UNAUTHORIZED)
        ) ;
    if (!user.getUsername().equals(signedJWT.getJWTClaimsSet().getSubject())) {
        throw new AppException(ErrorCode.UNAUTHORIZED);
    }
        String savedRefreshToken = redisService.getRefreshToken(user.getId()).orElseThrow(
                () -> new AppException(ErrorCode.UNAUTHORIZED)
        ) ;
        if(!savedRefreshToken.equals(token)){
            throw new AppException(ErrorCode.UNAUTHORIZED) ;
        }
        redisService.deleteRefreshToken(user.getId());
        String newAccessToken = generateAccessToken(user) ;
        String newRefreshToken = generateRefreshToken(user) ;
        redisService.savedRefreshToken(user.getId() , newRefreshToken);
        return AuthenticationResponse.builder()
                .authenticated(true)
                .refreshToken(newRefreshToken)
                .accessToken(newAccessToken)
                .build() ;
    }


    @Override
    public void register (RegisterRequest request){
        if(userRepository.existsByUsernameIgnoreCase(request.getUsername())){
            throw new AppException(ErrorCode.USERNAME_EXISTS) ;
        }
        if(userRepository.existsByEmailIgnoreCase(request.getEmail())){
            throw new AppException(ErrorCode.EMAIL_EXISTS) ;
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .role(Role.USER.name())
                .school(request.getSchool())
                .deleteFlag(false)
                .point(0)
                .phoneNumber(request.getPhoneNumber())
                .createdAt(LocalDateTime.now())
                .credit(INIT_CREDIT)
                .enable(false)
                .build() ;
        User savedUser = userRepository.save(user) ;
        String token = UUID.randomUUID().toString() ;
        VerificationToken verificationToken = VerificationToken.builder()
                .typeToken(TypeToken.EMAIL_VERIFICATION_TOKEN)
                .user(savedUser)
                .token(token)
                .expiryTime(LocalDateTime.now().plusHours(1))
                .createdAt(LocalDateTime.now())
                .build() ;
        verificationTokenRepository.save(verificationToken) ;
        emailService.sendVerificationEmail(savedUser.getEmail() , token);
    }

    @Override
    public void verifyEmail(String token){
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token).orElseThrow(
                () -> new AppException(ErrorCode.TOKEN_INVALID)
        ) ;
        if(verificationToken.isExpiry()){
            throw new AppException(ErrorCode.TOKEN_EXPIRED) ;
        }

        User user = verificationToken.getUser() ;
        user.setEnable(true);
        userRepository.save(user) ;
        verificationTokenRepository.delete(verificationToken);
    }
    @Override
    public void resendVerifyEmail(ResendTokenRequest request){
        User user = userRepository.findByEmailIgnoreCase(request.getEmail()).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTS)
        ) ;
        if(user.isEnable()){
            throw new AppException(ErrorCode.USER_ENABLED) ;
        }
        VerificationToken verificationToken = verificationTokenRepository.findByUserIdAndTypeToken(user.getId() , TypeToken.EMAIL_VERIFICATION_TOKEN).orElseThrow(
                () -> new AppException(ErrorCode.TOKEN_NOT_EXISTS)
        ) ;
        if(!verificationToken.isExpiry() &&
        verificationToken.getCreatedAt().isAfter(LocalDateTime.now().plusHours(1))
        ){
            throw new AppException(ErrorCode.TOKEN_EXISTS) ;
        }
        verificationTokenRepository.delete(verificationToken);
        String newToken = UUID.randomUUID().toString() ;
        VerificationToken newVerificationToken = VerificationToken.builder()
                .token(newToken)
                .user(user)
                .createdAt(LocalDateTime.now())
                .expiryTime(LocalDateTime.now().plusHours(1))
                .typeToken(TypeToken.EMAIL_VERIFICATION_TOKEN)
                .build()
                ;
        verificationTokenRepository.save(newVerificationToken) ;
        emailService.sendVerificationEmail(user.getEmail() , newToken);
    }

    @Override
    public void resendResetPassword(ResendTokenRequest request){
        User user = userRepository.findByEmailIgnoreCase(request.getEmail()).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTS)
        ) ;

        VerificationToken verificationToken = verificationTokenRepository.findByUserIdAndTypeToken(user.getId() , TypeToken.RESET_PASSWORD_TOKEN).orElseThrow(
                () -> new AppException(ErrorCode.TOKEN_NOT_EXISTS)
        ) ;
        if(!verificationToken.isExpiry() &&
                verificationToken.getCreatedAt().isAfter(LocalDateTime.now().plusHours(1))
        ){
            throw new AppException(ErrorCode.TOKEN_EXISTS) ;
        }
        verificationTokenRepository.delete(verificationToken);
        String newToken = UUID.randomUUID().toString() ;
        VerificationToken newVerificationToken = VerificationToken.builder()
                .token(newToken)
                .user(user)
                .typeToken(TypeToken.RESET_PASSWORD_TOKEN)
                .build();
        verificationTokenRepository.save(newVerificationToken) ;
        emailService.sendResetPasswordEmail(user.getEmail() , newToken);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request){
        User user = userRepository.findByEmailIgnoreCase(request.getEmail()).orElseThrow(
                () -> new AppException(ErrorCode.EMAIL_NOT_EXISTS)
        ) ;
        String token = UUID.randomUUID().toString() ;
        VerificationToken verificationToken = VerificationToken.builder()
                .expiryTime(LocalDateTime.now().plusHours(1))
                .createdAt(LocalDateTime.now())
                .typeToken(TypeToken.RESET_PASSWORD_TOKEN)
                .user(user)
                .token(token)
                .build() ;
        verificationTokenRepository.save(verificationToken) ;
        emailService.sendResetPasswordEmail(user.getEmail() , token);
    }

    @Override
    public void resetPassword(ResetPasswordRequest request){
        VerificationToken verificationToken = verificationTokenRepository.findByToken(request.getToken()).orElseThrow(
                () -> new AppException(ErrorCode.TOKEN_INVALID)
        ) ;
        if (verificationToken.getTypeToken() != TypeToken.RESET_PASSWORD_TOKEN) {
            throw new AppException(ErrorCode.TOKEN_INVALID);
        }
        if(verificationToken.isExpiry()){
            throw new AppException(ErrorCode.TOKEN_EXPIRED) ;
        }
        User user = verificationToken.getUser() ;
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user) ;
        verificationTokenRepository.delete(verificationToken);
    }

    @Override
    public boolean verifyUserIdentity(String token, int userId) {
        try {
            // Bước 1: Dùng lại hàm `verifiedToken` để giải mã và xác thực token
            SignedJWT signedJWT = verifiedToken(token, false);

            // Bước 2: Lấy claim "id" từ token. Vì ID trong DB là integer,
            // ta dùng getIntegerClaim để lấy đúng kiểu dữ liệu.
            Integer idFromToken = signedJWT.getJWTClaimsSet().getIntegerClaim("id");

            // Bước 3: Kiểm tra null và so sánh id từ token với id được truyền vào
            if (idFromToken == null) {
                return false;
            }
            return Objects.equals(idFromToken, userId);

        } catch (Exception e) {
            // Nếu có bất kỳ lỗi nào xảy ra (token hết hạn, sai chữ ký, sai định dạng)
            // thì đều coi như xác thực thất bại.
            log.error("Token verification failed for user {}: {}", userId, e.getMessage());
            return false;
        }
    }
}
