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
public class OperatorSupportController {
  private final SupportService support;
  private final TelegramMiniAppAuth auth;

  OperatorSupportController(SupportService support, TelegramMiniAppAuth auth) { this.support = support; this.auth = auth; }

  @GetMapping("/api/support/operator/conversations")
  ResponseEntity<?> conversations(@RequestHeader(value = "X-Telegram-Init-Data", required = false) String initData,
      @RequestParam(defaultValue = "pending") String filter) {
    auth.requireOperator(initData);
    return noStore(support.operatorConversations(filter));
  }

  @GetMapping("/api/support/operator/conversations/{id}")
  ResponseEntity<?> conversation(@RequestHeader(value = "X-Telegram-Init-Data", required = false) String initData,
      @PathVariable UUID id) {
    auth.requireOperator(initData);
    return noStore(support.operatorConversation(id));
  }

  @PostMapping("/api/support/operator/conversations/{id}/decision")
  ResponseEntity<?> decision(@RequestHeader(value = "X-Telegram-Init-Data", required = false) String initData,
      @PathVariable UUID id, @RequestBody(required = false) DecisionRequest request) {
    auth.requireOperator(initData);
    boolean changed = request != null && Boolean.TRUE.equals(request.accept())
        ? support.acceptOperator(id) : request != null && Boolean.FALSE.equals(request.accept()) && support.declineOperator(id);
    if (!changed) throw new ApiException(409, "Обращение уже обработано или не найдено.");
    return noStore(support.operatorConversation(id));
  }

  @PostMapping("/api/support/operator/conversations/{id}/messages")
  ResponseEntity<?> reply(@RequestHeader(value = "X-Telegram-Init-Data", required = false) String initData,
      @PathVariable UUID id, @RequestBody(required = false) ReplyRequest request) {
    auth.requireOperator(initData);
    if (request == null || request.text() == null || request.text().isBlank() || request.text().length() > 2000)
      throw new ApiException(400, "Напишите ответ длиной до 2000 символов.");
    if (!support.operatorReply(id, request.text())) throw new ApiException(409, "Обращение уже закрыто или не найдено.");
    return noStore(support.operatorConversation(id));
  }

  private static ResponseEntity<?> noStore(Object body) {
    return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(body);
  }

  record DecisionRequest(Boolean accept) {}
  record ReplyRequest(String text) {}
}
