package com.uyol.backend;

import java.util.Map;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiErrorHandler {
  private static final Logger log = LoggerFactory.getLogger(ApiErrorHandler.class);

  @ExceptionHandler(ApiException.class)
  ResponseEntity<?> expected(ApiException error) { return ResponseEntity.status(error.status()).body(Map.of("error", error.getMessage())); }
  @ExceptionHandler(Exception.class)
  ResponseEntity<?> unexpected(Exception error) {
    if (Boolean.parseBoolean(System.getenv().getOrDefault("LOG_STACKTRACE", "false"))) {
      log.error("Не удалось обработать запрос. Технические подробности:", error);
    } else {
      log.error("Не удалось обработать запрос. Для подробного журнала установи LOG_STACKTRACE=true.");
    }
    return ResponseEntity.status(HttpStatusCode.valueOf(500)).body(Map.of("error", "Внутренняя ошибка сервера."));
  }
}
