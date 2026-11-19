package com.uyol.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Verifies Telegram Web App initData before any operator API call. */
@Component
public class TelegramMiniAppAuth {
  private final String botToken;
  private final String operatorUserId;
  private final ObjectMapper json;

  TelegramMiniAppAuth(@Value("${uyol.support.telegram-token:}") String botToken,
      @Value("${uyol.support.telegram-operator-user-id:}") String operatorUserId, ObjectMapper json) {
    this.botToken = botToken;
    this.operatorUserId = operatorUserId;
    this.json = json;
  }

  public void requireOperator(String initData) {
    if (botToken.isBlank() || operatorUserId.isBlank())
      throw new ApiException(503, "Панель оператора не настроена на сервере.");
    if (initData == null || initData.isBlank() || initData.length() > 8192)
      throw new ApiException(401, "Откройте панель через Telegram.");
    try {
      Map<String, String> values = new TreeMap<>();
      for (String pair : initData.split("&")) {
        int separator = pair.indexOf('=');
        if (separator < 1) continue;
        values.put(URLDecoder.decode(pair.substring(0, separator), StandardCharsets.UTF_8),
            URLDecoder.decode(pair.substring(separator + 1), StandardCharsets.UTF_8));
      }
      String suppliedHash = values.remove("hash");
      String authDate = values.get("auth_date");
      if (suppliedHash == null || !suppliedHash.matches("[a-fA-F0-9]{64}") || authDate == null)
        throw new ApiException(401, "Данные Telegram недействительны.");
      long timestamp = Long.parseLong(authDate);
      long now = Instant.now().getEpochSecond();
      if (timestamp > now + 300 || now - timestamp > 86400)
        throw new ApiException(401, "Сессия Telegram устарела. Откройте панель заново.");
      String checkString = values.entrySet().stream().map(e -> e.getKey() + "=" + e.getValue())
          .reduce((a, b) -> a + "\n" + b).orElse("");
      byte[] secret = hmac("WebAppData".getBytes(StandardCharsets.UTF_8), botToken);
      byte[] expected = hmac(secret, checkString);
      byte[] supplied = java.util.HexFormat.of().parseHex(suppliedHash);
      if (!MessageDigest.isEqual(expected, supplied)) throw new ApiException(401, "Данные Telegram недействительны.");
      JsonNode user = json.readTree(values.getOrDefault("user", "{}")).path("id");
      if (!user.asText().equals(operatorUserId)) throw new ApiException(403, "У вас нет доступа к панели оператора.");
    } catch (ApiException error) {
      throw error;
    } catch (Exception error) {
      throw new ApiException(401, "Не удалось проверить авторизацию Telegram.");
    }
  }

  private static byte[] hmac(byte[] key, String value) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(key, "HmacSHA256"));
    return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
  }
}
