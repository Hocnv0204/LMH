package com.lmh.web.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@Slf4j
public class LogTestController {

    @GetMapping("/logs")
    public String testLogs() {
        log.trace("TRACE level log message");
        log.debug("DEBUG level log message");
        log.info("INFO level log message");
        log.warn("WARN level log message");
        log.error("ERROR level log message");
        return "Log messages generated successfully";
    }
}