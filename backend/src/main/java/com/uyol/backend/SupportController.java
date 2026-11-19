package com.uyol.backend;

import java.util.Map;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SupportController {
  private final SupportService support;
  private final TelegramSupportBot telegram;
  SupportController(SupportService support, TelegramSupportBot telegram) { this.support = support; this.telegram = telegram; }

  @PostMapping("/api/support/conversations")
  ResponseEntity<?> create(@RequestBody(required = false) CreateRequest body,
      @RequestHeader(value = "X-Forwarded-For", required = false) String forwarded,
      @RequestHeader(value = "X-Real-IP", required = false) String realIp) {
    String ip = forwarded == null ? (realIp == null ? "unknown" : realIp) : forwarded.split(",")[0].trim();
    return ResponseEntity.status(201).cacheControl(CacheControl.noStore()).body(support.create(body == null ? "ru" : body.locale(), ip));
  }

  @PostMapping("/api/support/conversations/{id}/messages")
  ResponseEntity<?> send(@PathVariable UUID id, @RequestHeader(value = "X-Support-Token", required = false) String token,
      @RequestHeader(value = "X-Forwarded-For", required = false) String forwarded,
      @RequestHeader(value = "X-Real-IP", required = false) String realIp, @RequestBody SendRequest body) {
    String ip = forwarded == null ? (realIp == null ? "unknown" : realIp) : forwarded.split(",")[0].trim();
    Map<String, Object> result = support.send(id, token, body == null ? null : body.text(), ip, telegram.isConfigured());
    if (Boolean.TRUE.equals(result.get("notifyOperator"))) telegram.notifyOperator(id, support.operatorPreview(id), Boolean.TRUE.equals(result.get("pending")));
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(result);
  }

  @GetMapping("/api/support/conversations/{id}/messages")
  ResponseEntity<?> poll(@PathVariable UUID id, @RequestHeader(value = "X-Support-Token", required = false) String token,
      @RequestParam(defaultValue = "0") long after) {
    if (after < 0) throw new ApiException(400, "Некорректный номер сообщения.");
    support.authorize(id, token);
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(Map.of("messages", support.messages(id, after)));
  }

  record CreateRequest(String locale) {}
  record SendRequest(String text) {}
}
