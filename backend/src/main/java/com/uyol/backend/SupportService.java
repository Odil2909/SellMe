package com.uyol.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class SupportService {
  private static final Logger log = LoggerFactory.getLogger(SupportService.class);
  private static final SecureRandom RANDOM = new SecureRandom();
  private static final ConcurrentHashMap<String, Window> LIMITS = new ConcurrentHashMap<>();
  private final JdbcTemplate db;
  private final ObjectMapper json;
  private final String aiKey, aiBaseUrl, aiModel;
  private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

  SupportService(JdbcTemplate db, ObjectMapper json,
      @Value("${uyol.support.ai-key:}") String aiKey,
      @Value("${uyol.support.ai-base-url:https://api.openai.com/v1}") String aiBaseUrl,
      @Value("${uyol.support.ai-model:gpt-4o-mini}") String aiModel) {
    this.db = db; this.json = json; this.aiKey = aiKey; this.aiBaseUrl = aiBaseUrl; this.aiModel = aiModel;
  }

  public Map<String, Object> create(String locale, String ip) {
    if (limited("new:" + ip)) throw new ApiException(429, "Не удалось открыть новый чат. Попробуйте через минуту.");
    UUID id = UUID.randomUUID(); byte[] bytes = new byte[32]; RANDOM.nextBytes(bytes);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    String language = List.of("ru", "en", "uz").contains(locale) ? locale : "ru";
    db.update("INSERT INTO support_conversations(id,access_token_hash,locale) VALUES(?,?,?)", id, hash(token), language);
    String welcome = switch (language) {
      case "en" -> "Hello! I can help with using uy-ol. If I cannot solve the issue, I will pass the conversation to support.";
      case "uz" -> "Salom! uy-ol xizmatidan foydalanish bo‘yicha yordam beraman. Masalani hal qila olmasam, suhbatni operatorga yuboraman.";
      default -> "Здравствуйте! Помогу с работой uy-ol. Если не смогу решить вопрос, передам переписку оператору поддержки.";
    };
    addMessage(id, "assistant", welcome);
    return Map.of("conversationId", id.toString(), "accessToken", token, "messages", messages(id, 0));
  }

  public Map<String, Object> send(UUID id, String token, String text, String ip, boolean operatorEnabled) {
    authorize(id, token);
    if (text == null || text.isBlank() || text.length() > 2000) throw new ApiException(400, "Напишите сообщение длиной до 2000 символов.");
    if (limited(ip)) throw new ApiException(429, "Слишком много сообщений. Попробуйте немного позже.");
    String clean = text.replace("\u0000", "").trim();
    if (clean.isEmpty()) throw new ApiException(400, "Сообщение пустое.");
    String currentStatus = db.queryForObject("SELECT status FROM support_conversations WHERE id=?", String.class, id);
    addMessage(id, "user", clean);
    if ("operator".equals(currentStatus)) return Map.of("handoff", true, "pending", false, "notifyOperator", true, "messages", messages(id, 0));
    if ("pending_operator".equals(currentStatus)) return Map.of("handoff", true, "pending", true, "notifyOperator", true, "messages", messages(id, 0));
    String locale = db.queryForObject("SELECT locale FROM support_conversations WHERE id=?", String.class, id);
    boolean operatorAsked = clean.toLowerCase().matches(".*(оператор|человек|поддержк|живой специалист|operator|human|support agent|operatorga|operator bilan).*" );
    Reply reply = operatorAsked ? new Reply(handoffText(locale), true) : askAi(id, locale, clean);
    if (reply.handoff && !operatorEnabled) reply = new Reply(operatorUnavailable(locale), false);
    if (reply.handoff) db.update("UPDATE support_conversations SET status='pending_operator',last_activity_at=now() WHERE id=?", id);
    addMessage(id, "assistant", reply.text);
    return Map.of("handoff", reply.handoff, "pending", reply.handoff, "notifyOperator", reply.handoff, "messages", messages(id, 0));
  }

  public List<Map<String, Object>> messages(UUID id, long after) {
    return db.query("SELECT id,sender,body,created_at FROM support_messages WHERE conversation_id=? AND id>? ORDER BY id",
      (rs, row) -> Map.of("id", rs.getLong("id"), "sender", rs.getString("sender"), "text", rs.getString("body"), "createdAt", rs.getTimestamp("created_at").toInstant().toString()), id, after);
  }

  public List<Map<String, Object>> operatorConversations(String filter) {
    if (!List.of("pending", "active", "all").contains(filter)) throw new ApiException(400, "Выберите корректный список обращений.");
    String status = filter.equals("pending") ? "pending_operator" : filter.equals("active") ? "operator" : "all";
    return db.query("""
        SELECT c.id::text AS id,c.status,c.locale,c.last_activity_at,
          COALESCE((SELECT m.body FROM support_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1),'') AS preview,
          COALESCE((SELECT m.sender FROM support_messages m WHERE m.conversation_id=c.id ORDER BY m.id DESC LIMIT 1),'') AS last_sender
        FROM support_conversations c
        WHERE (?='all' OR c.status=?)
        ORDER BY c.last_activity_at DESC LIMIT 100
        """, (rs, row) -> Map.of("id", rs.getString("id"), "status", rs.getString("status"),
          "locale", rs.getString("locale"), "preview", rs.getString("preview"),
          "lastSender", rs.getString("last_sender"), "updatedAt", rs.getTimestamp("last_activity_at").toInstant().toString()), status, status);
  }

  public Map<String, Object> operatorConversation(UUID id) {
    return db.query("SELECT status,locale,last_activity_at FROM support_conversations WHERE id=?", rs -> {
      if (!rs.next()) throw new ApiException(404, "Обращение не найдено.");
      return Map.of("id", id.toString(), "status", rs.getString("status"), "locale", rs.getString("locale"),
        "updatedAt", rs.getTimestamp("last_activity_at").toInstant().toString(), "messages", messages(id, 0));
    }, id);
  }

  public void authorize(UUID id, String token) {
    if (token == null || token.length() < 30) throw new ApiException(401, "Сессия чата истекла. Откройте чат заново.");
    Integer found = db.query("SELECT 1 FROM support_conversations WHERE id=? AND access_token_hash=?", rs -> rs.next() ? 1 : null, id, hash(token));
    if (found == null) throw new ApiException(404, "Диалог не найден.");
  }

  public boolean operatorReply(UUID id, String text) {
    if (text == null || text.isBlank() || text.length() > 2000) return false;
    Integer found = db.query("SELECT 1 FROM support_conversations WHERE id=? AND status='operator'", rs -> rs.next() ? 1 : null, id);
    if (found == null) return false;
    addMessage(id, "operator", text.trim());
    return true;
  }

  public boolean acceptOperator(UUID id) {
    int updated = db.update("UPDATE support_conversations SET status='operator',last_activity_at=now() WHERE id=? AND status='pending_operator'", id);
    if (updated == 0) return false;
    String locale = db.queryForObject("SELECT locale FROM support_conversations WHERE id=?", String.class, id);
    addMessage(id, "operator", operatorAccepted(locale));
    return true;
  }

  public boolean declineOperator(UUID id) {
    int updated = db.update("UPDATE support_conversations SET status='bot',last_activity_at=now() WHERE id=? AND status='pending_operator'", id);
    if (updated == 0) return false;
    String locale = db.queryForObject("SELECT locale FROM support_conversations WHERE id=?", String.class, id);
    addMessage(id, "system", operatorDeclined(locale));
    return true;
  }

  public String operatorPreview(UUID id) {
    return db.query("SELECT body FROM support_messages WHERE conversation_id=? AND sender='user' ORDER BY id DESC LIMIT 1", rs -> rs.next() ? rs.getString(1) : "Сообщение пользователя", id);
  }

  private Reply askAi(UUID id, String locale, String userText) {
    if (aiKey.isBlank()) {
      String answer = faq(locale, userText);
      return answer == null ? new Reply(handoffText(locale), true) : new Reply(answer, false);
    }
    try {
      List<Map<String, String>> conversation = new ArrayList<>();
      conversation.add(Map.of("role", "system", "content", "Ты — техническая поддержка сайта uy-ol, сервиса недвижимости в Узбекистане. Отвечай кратко, по делу и на языке пользователя (ru/en/uz). Не выдумывай функции и не проси пароли, коды подтверждения или платежные данные. Если информации не хватает, пользователь сообщает о сбое/безопасности/деньгах, либо ты не уверен, верни строго JSON {\"answer\":\"краткий ответ\",\"needsOperator\":true}. Иначе верни JSON с needsOperator false. Не выполняй действия от имени пользователя."));
      db.query("SELECT sender,body FROM (SELECT sender,body,id FROM support_messages WHERE conversation_id=? ORDER BY id DESC LIMIT 12) m ORDER BY id", rs -> { while (rs.next()) conversation.add(Map.of("role", rs.getString(1).equals("user") ? "user" : "assistant", "content", rs.getString(2))); }, id);
      Map<String,Object> payload = Map.of("model", aiModel, "temperature", 0.2, "response_format", Map.of("type", "json_object"), "messages", conversation);
      String endpoint = aiBaseUrl.replaceAll("/+$", "") + "/chat/completions";
      HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint)).timeout(Duration.ofSeconds(25))
        .header("Authorization", "Bearer " + aiKey).header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(payload))).build();
      HttpResponse<String> response = http.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        String errorType = "не указан", errorCode = "не указан";
        try {
          JsonNode providerError = json.readTree(response.body()).path("error");
          errorType = safeDiagnostic(providerError.path("type").asText("не указан"));
          errorCode = safeDiagnostic(providerError.path("code").asText("не указан"));
        } catch (Exception ignored) { }
        log.warn("OpenAI ответил HTTP {} (тип: {}, код: {}).", response.statusCode(), errorType, errorCode);
        return new Reply(handoffText(locale), true);
      }
      JsonNode root = json.readTree(response.body());
      JsonNode content = root.path("choices").path(0).path("message").path("content");
      JsonNode result = json.readTree(content.asText());
      String answer = result.path("answer").asText("").trim();
      boolean handoff = result.path("needsOperator").asBoolean(true);
      if (answer.isBlank() || answer.length() > 4000) throw new IllegalStateException("AI returned an invalid answer");
      return new Reply(handoff ? answer + "\n\n" + handoffText(locale) : answer, handoff);
    } catch (Exception error) {
      log.warn("Помощник временно недоступен; тип ошибки: {}.", error.getClass().getSimpleName());
      return new Reply(handoffText(locale), true);
    }
  }

  private static String faq(String locale, String text) {
    String q = text.toLowerCase();
    if (q.matches(".*(объявлен|размест|опубликов|листинг|listing|эълон).*")) return localized(locale,
      "Чтобы разместить объект, войдите в аккаунт, нажмите «Разместить», заполните данные и добавьте фотографии. После отправки объявление появится в каталоге.",
      "To publish a property, sign in, select “Post listing”, fill in the details and add photos. It will appear in the catalog after submission.",
      "E’lon joylash uchun hisobga kiring, «Joylashtirish» tugmasini bosing, ma’lumotlarni kiriting va rasmlar qo‘shing.");
    if (q.matches(".*(парол|войти|вход|аккаунт|login|password|sign in|kirish|parol).*")) return localized(locale,
      "Откройте раздел «Войти» и укажите номер телефона и пароль. Если войти не получается, напишите, что именно отображается — при необходимости подключу оператора.",
      "Open “Sign in” and enter your phone number and password. Tell me what you see if it fails; I can bring in an operator if needed.",
      "«Kirish» bo‘limini ochib, telefon raqamingiz va parolingizni kiriting. Muammo bo‘lsa, ekranda nima chiqayotganini yozing.");
    if (q.matches(".*(оценк|стоимост|цену|valuation|price estimate|bahola).*")) return localized(locale,
      "Откройте раздел «Оценить», заполните параметры объекта и нажмите «Получить ориентир». Это предварительная оценка, а не официальная экспертиза.",
      "Open “Valuation”, enter the property details and select “Get estimate”. This is an indicative estimate, not a formal appraisal.",
      "«Baholash» bo‘limini oching, obyekt ma’lumotlarini kiriting va «Taxminiy narx»ni bosing. Bu rasmiy baholash emas.");
    if (q.matches(".*(фото|загруз|изображен|photo|upload|rasm).*")) return localized(locale,
      "При публикации нажмите на область добавления фото. Используйте JPG, PNG, WebP или GIF; если ошибка повторится, напишите размер файла и текст ошибки.",
      "When publishing, select the photo upload area. JPG, PNG, WebP and GIF are supported. If it fails again, tell me the file size and error shown.",
      "E’lon joylashda rasm qo‘shish maydonini bosing. JPG, PNG, WebP va GIF formatlari qo‘llanadi. Xato takrorlansa, fayl hajmi va xabarni yozing.");
    if (q.matches(".*(карта|поиск|фильтр|район|каталог|map|search|filter|xarita|qidir).*")) return localized(locale,
      "В каталоге выберите город и район, задайте тип недвижимости и диапазон цены. Переключатель рядом с результатами меняет список и карту.",
      "In the catalog, choose a city and district, property type and price range. The control beside the results switches between list and map.",
      "Katalogda shahar, tuman, mulk turi va narx oralig‘ini tanlang. Natijalar yonidagi tugma ro‘yxat va xaritani almashtiradi.");
    return null;
  }
  private static String localized(String locale, String ru, String en, String uz) { return switch (locale) { case "en" -> en; case "uz" -> uz; default -> ru; }; }
  private static String handoffText(String locale) { return switch (locale) {
    case "en" -> "I could not confidently resolve this. I sent a request to a support operator; the chat will switch after they accept it.";
    case "uz" -> "Bu savolga ishonchli javob bera olmadim. Operatorga so‘rov yuborildi; u qabul qilgach suhbat ulanadi.";
    default -> "Не хочу вводить вас в заблуждение. Отправил запрос оператору; чат переключится после его подтверждения.";
  }; }
  private static String operatorAccepted(String locale) { return switch (locale) {
    case "en" -> "A support operator accepted your request. You can continue the conversation here.";
    case "uz" -> "Operator so‘rovingizni qabul qildi. Suhbatni shu yerda davom ettirishingiz mumkin.";
    default -> "Оператор принял запрос и подключился к чату. Продолжайте переписку здесь.";
  }; }
  private static String operatorDeclined(String locale) { return switch (locale) {
    case "en" -> "The operator could not accept the request right now. You can continue with the assistant or request an operator again later.";
    case "uz" -> "Operator hozir so‘rovni qabul qila olmadi. Yordamchi bilan davom eting yoki keyinroq qayta so‘rov yuboring.";
    default -> "Оператор сейчас не смог принять запрос. Можете продолжить с помощником или позвать оператора позже.";
  }; }
  private static String operatorUnavailable(String locale) { return switch (locale) {
    case "en" -> "I could not confidently resolve this, and live operator chat is not connected yet. Please contact support at https://t.me/Bredlyban2.";
    case "uz" -> "Savolingizni ishonchli hal qila olmadim, operator chati hali ulanmagan. https://t.me/Bredlyban2 orqali bog‘laning.";
    default -> "Не удалось уверенно решить вопрос, а чат с оператором пока не подключён. Напишите в Telegram: https://t.me/Bredlyban2.";
  }; }
  private void addMessage(UUID id, String sender, String body) {
    db.update("INSERT INTO support_messages(conversation_id,sender,body) VALUES(?,?,?)", id, sender, body);
    db.update("UPDATE support_conversations SET last_activity_at=now() WHERE id=?", id);
  }
  private static String hash(String value) {
    try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
    catch (Exception e) { throw new IllegalStateException(e); }
  }
  private static String safeDiagnostic(String value) {
    return value != null && value.matches("[A-Za-z0-9_.-]{1,80}") ? value : "не указан";
  }
  private static boolean limited(String key) {
    long now = System.currentTimeMillis(); Window w = LIMITS.compute(key, (k,v) -> v == null || now - v.start > 60_000 ? new Window(now,1) : new Window(v.start,v.count+1)); return w.count > 12;
  }
  private record Window(long start, int count) {}
  private record Reply(String text, boolean handoff) {}
}
