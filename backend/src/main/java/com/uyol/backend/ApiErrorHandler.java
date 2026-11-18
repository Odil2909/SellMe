package com.uyol.backend;

import java.util.Map;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiErrorHandler {
  @ExceptionHandler(ApiException.class)
  ResponseEntity<?> expected(ApiException error) { return ResponseEntity.status(error.status()).body(Map.of("error", error.getMessage())); }
  @ExceptionHandler(Exception.class)
  ResponseEntity<?> unexpected(Exception error) {
    error.printStackTrace();
    return ResponseEntity.status(HttpStatusCode.valueOf(500)).body(Map.of("error", "Внутренняя ошибка сервера."));
  }
}
