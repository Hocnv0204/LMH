package com.lmh.web.common.utils;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class PageableUtils {
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static Pageable createPageable(int size, int page, String sortBy){
        return PageRequest.of(Math.max(page, DEFAULT_PAGE_NUMBER), Math.min(size, DEFAULT_PAGE_SIZE), Sort.Direction.ASC, sortBy);
    }
    public static Pageable pageable(int size , int page , String sortBy , String sort){
        Sort.Direction orderBy = (sort != null) ? Sort.Direction.fromString(sort) : Sort.Direction.ASC ;
        return PageRequest.of(Math.max(page, DEFAULT_PAGE_NUMBER), Math.min(size, DEFAULT_PAGE_SIZE), Sort.by(orderBy , sortBy)) ;
    }
}
