package com.ssafy.fcc.config.security;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.ObjectUtils;
import org.springframework.web.filter.GenericFilterBean;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

public class JwtAuthenticationFilter extends GenericFilterBean {

    private JwtTokenProvider jwtTokenProvider; // JWT 토큰을 생성 및 검증 모듈 클래스
    private final RedisTemplate redisTemplate;

    // Jwt Provider 주입
    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider, RedisTemplate redisTemplate) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.redisTemplate = redisTemplate;
    }

    // Request로 들어오는 Jwt Token의 유효성을 검증 (jwtTokenProvider.validateToken)하는
    // filter를 filterChain에 등록한다.
    @Override
    public void  doFilter(ServletRequest request, ServletResponse response, FilterChain filterChain)
        throws IOException, ServletException{

        String token = jwtTokenProvider.resolveToken((HttpServletRequest) request);  // resolveToken : Request의 Header에서 token 파싱

        System.out.println("=============token=================: "+token);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            Authentication auth = jwtTokenProvider.getAuthentication(token); // validateToken : Jwt 토큰의 유효성 + 만료일자 확인
            SecurityContextHolder.getContext().setAuthentication(auth);  // getAuthentication : Jwt 토큰으로 인증 정보 조회


        }


        filterChain.doFilter(request, response);

    }
}