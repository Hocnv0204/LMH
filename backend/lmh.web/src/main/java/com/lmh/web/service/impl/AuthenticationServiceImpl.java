package com.lmh.web.service.impl;

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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
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

    @Override
    public AuthenticationResponse login(LoginRequest request) {
        var user = userRepository.findByUsername(request.getUsername()).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTS)
        );

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
                .subject(user.getUsername())
                .issuer("LMH")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()
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
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean valid = true;
        try {
            verifiedToken(token, false);
        } catch (AppException e) {
            e.printStackTrace();
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
        var user = userRepository.findByUsername(signedJWT.getJWTClaimsSet().getSubject()).orElseThrow(
                () -> new AppException(ErrorCode.UNAUTHORIZED)
        ) ;
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

}
