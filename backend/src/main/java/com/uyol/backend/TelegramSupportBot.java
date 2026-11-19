package com.uyol.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class TelegramSupportBot {
  private static final Logger log = LoggerFactory.getLogger(TelegramSupportBot.class);
  private final String token, operatorChatId, webAppUrl;
  private final SupportService support;
  private final ObjectMapper json;
  private final JdbcTemplate db;
  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();
  private final AtomicLong offset = new AtomicLong(0);

  TelegramSupportBot(@Value("${uyol.support.telegram-token:}") String token,
      @Value("${uyol.support.telegram-operator-chat-id:}") String operatorChatId,
      @Value("${uyol.support.telegram-webapp-url:}") String webAppUrl,
      SupportService support, ObjectMapper json, JdbcTemplate db) {
    this.token = token; this.operatorChatId = operatorChatId; this.webAppUrl = webAppUrl; this.support = support; this.json = json; this.db = db;
  }

  @PostConstruct void startPolling() {
    if (token.isBlank() || operatorChatId.isBlank()) {
      log.info("Чат поддержки работает. Уведомления оператору Telegram отключены: настройте SUPPORT_TELEGRAM_BOT_TOKEN и SUPPORT_TELEGRAM_OPERATOR_CHAT_ID.");
      return;
    }
    Long savedOffset = db.queryForObject("SELECT update_offset FROM support_telegram_state WHERE id=1", Long.class);
    if (savedOffset != null) offset.set(savedOffset);
    Thread worker = new Thread(this::pollLoop, "uyol-telegram-support"); worker.setDaemon(true); worker.start();
    log.info("Связь технической поддержки с Telegram-оператором включена.");
  }

  public void notifyOperator(UUID id, String latestUserMessage, boolean awaitingDecision) {
    if (!isConfigured()) return;
    String message = (awaitingDecision ? "Запрос на подключение оператора\n" : "Новое сообщение в активном чате\n")
      + "Заявка: " + id + (awaitingDecision ? "\nПримите запрос или откажите кнопками ниже." : "\nОтветьте командой: /reply " + id + " ваш ответ")
      + "\n\nПоследнее сообщение пользователя:\n" + latestUserMessage;
    Map<String, Object> body = new HashMap<>();
    body.put("chat_id", operatorChatId); body.put("text", message); body.put("disable_web_page_preview", true);
    if (awaitingDecision) body.put("reply_markup", Map.of("inline_keyboard", List.of(List.of(
      Map.of("text", "✅ Принять", "callback_data", "uyol:accept:" + id),
      Map.of("text", "❌ Отказать", "callback_data", "uyol:decline:" + id)
    ))));
    telegramRequest("sendMessage", body);
  }

  public boolean isConfigured() { return !token.isBlank() && !operatorChatId.isBlank(); }

  private void pollLoop() {
    while (!Thread.currentThread().isInterrupted()) {
      try {
        String url = api("getUpdates") + "?timeout=25&offset=" + offset.get();
        HttpRequest request = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(35)).GET().build();
        HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) { Thread.sleep(3000); continue; }
        JsonNode updates = json.readTree(response.body()).path("result");
        for (JsonNode update : updates) {
          long nextOffset = update.path("update_id").asLong() + 1;
          handleUpdate(update);
          offset.set(nextOffset);
          db.update("UPDATE support_telegram_state SET update_offset=? WHERE id=1", nextOffset);
        }
      } catch (InterruptedException stop) { Thread.currentThread().interrupt(); }
      catch (Exception error) {
        log.warn("Не удалось получить сообщения Telegram. Повторное подключение через несколько секунд.");
        try { Thread.sleep(3000); } catch (InterruptedException stop) { Thread.currentThread().interrupt(); }
      }
    }
  }

  private void handleUpdate(JsonNode update) {
    JsonNode callback = update.path("callback_query");
    if (!callback.isMissingNode()) { handleCallback(callback); return; }
    JsonNode message = update.path("message");
    if (message.isMissingNode() || !message.path("chat").path("id").asText().equals(operatorChatId)) return;
    String text = message.path("text").asText("").trim();
    if (text.matches("^/panel(?:@\\w+)?(?:\\s.*)?$")) {
      if (!webAppUrl.startsWith("https://")) {
        send(Map.of("chat_id", operatorChatId, "text", "Панель готова, но для запуска Mini App нужен публичный HTTPS адрес. Укажите его в SUPPORT_TELEGRAM_WEBAPP_URL и перезапустите сервер."));
      } else {
        Map<String, Object> button = Map.of("text", "Открыть панель поддержки", "web_app", Map.of("url", webAppUrl));
        send(Map.of("chat_id", operatorChatId, "text", "Управление обращениями uy-ol", "reply_markup", Map.of("keyboard", List.of(List.of(button)), "resize_keyboard", true, "is_persistent", true)));
      }
      return;
    }
    if (!text.startsWith("/reply ")) return;
    String[] parts = text.split("\\s+", 3);
    if (parts.length < 3) { send(Map.of("chat_id", operatorChatId, "text", "Формат: /reply ID_ЗАЯВКИ текст ответа")); return; }
    try {
      UUID id = UUID.fromString(parts[1]);
      if (support.operatorReply(id, parts[2])) send(Map.of("chat_id", operatorChatId, "text", "Ответ отправлен пользователю. Заявка " + id));
      else send(Map.of("chat_id", operatorChatId, "text", "Открытая заявка не найдена: " + id));
    } catch (IllegalArgumentException invalid) {
      send(Map.of("chat_id", operatorChatId, "text", "Проверьте ID заявки и повторите команду."));
    }
  }

  private void handleCallback(JsonNode callback) {
    JsonNode message = callback.path("message");
    String callbackId = callback.path("id").asText("");
    if (callbackId.isBlank() || !message.path("chat").path("id").asText().equals(operatorChatId)) return;
    String[] parts = callback.path("data").asText("").split(":", 3);
    if (parts.length != 3 || !parts[0].equals("uyol")) return;
    try {
      UUID id = UUID.fromString(parts[2]);
      boolean accepted = parts[1].equals("accept") && support.acceptOperator(id);
      boolean declined = parts[1].equals("decline") && support.declineOperator(id);
      if (accepted || declined) {
        String result = accepted ? "Заявка принята. Оператор подключён к чату." : "Запрос отклонён. Пользователь сможет продолжить с ИИ.";
        telegramRequest("answerCallbackQuery", Map.of("callback_query_id", callbackId, "text", result));
        telegramRequest("editMessageReplyMarkup", Map.of("chat_id", operatorChatId, "message_id", message.path("message_id").asLong(), "reply_markup", Map.of("inline_keyboard", List.of())));
      } else {
        telegramRequest("answerCallbackQuery", Map.of("callback_query_id", callbackId, "text", "Заявка уже обработана или не найдена."));
      }
    } catch (IllegalArgumentException invalid) {
      telegramRequest("answerCallbackQuery", Map.of("callback_query_id", callbackId, "text", "Некорректный номер заявки."));
    }
  }

  private void send(Map<String, Object> body) {
    telegramRequest("sendMessage", body);
  }

  private void telegramRequest(String method, Map<String, Object> body) {
    try {
      HttpRequest request = HttpRequest.newBuilder(URI.create(api(method))).timeout(Duration.ofSeconds(12))
        .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body))).build();
      HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) log.warn("Telegram не обработал действие поддержки (HTTP {}). Проверьте настройки бота и chat ID.", response.statusCode());
    } catch (Exception error) { log.warn("Не удалось отправить уведомление оператору Telegram."); }
  }

  private String api(String method) { return "https://api.telegram.org/bot" + token + "/" + method; }
}
