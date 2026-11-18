package com.uyol.backend;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import org.bouncycastle.crypto.generators.SCrypt;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {
  public static final String COOKIE = "uyol_session";
  private static final SecureRandom RANDOM = new SecureRandom();
  private final JdbcTemplate db;
  public AccountService(JdbcTemplate db) { this.db = db; }

  public Map<String,Object> user(String cookie) {
    String token = token(cookie);
    if (token.isBlank()) return null;
    var rows = db.query("SELECT u.id, u.phone FROM makon_sessions s JOIN makon_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>now()", (rs,n)->Map.<String,Object>of("id",rs.getObject("id").toString(),"phone",rs.getString("phone")), hash(token));
    return rows.isEmpty() ? null : rows.get(0);
  }

  @Transactional
  public AuthResult account(String method, Map<String,Object> body, String cookie) {
    if (method.equals("GET")) { var responseBody=new java.util.LinkedHashMap<String,Object>(); responseBody.put("user",user(cookie)); return new AuthResult(200,responseBody,null); }
    if (method.equals("DELETE")) { String t=token(cookie); if(!t.isBlank()) db.update("DELETE FROM makon_sessions WHERE token_hash=?",hash(t)); return new AuthResult(200,Map.of("ok",true),clearCookie()); }
    if (!method.equals("POST")) throw new ApiException(405,"Метод не поддерживается.");
    String action=String.valueOf(body.getOrDefault("action","")); String phone=normalizePhone(body.get("phone")); Object rawPassword=body.get("password");
    if(phone.isBlank()) throw new ApiException(400,"Укажите корректный номер телефона Узбекистана.");
    if(!(rawPassword instanceof String password)||password.length()<8||password.length()>128) throw new ApiException(400,"Пароль должен содержать от 8 до 128 символов.");
    if(action.equals("register")) {
      UUID id=UUID.randomUUID();
      try { db.update("INSERT INTO makon_users(id,phone,password_hash) VALUES(?,?,?)",id,phone,hashPassword(password)); }
      catch(org.springframework.dao.DuplicateKeyException e) { throw new ApiException(409,"Аккаунт с таким номером уже существует. Войдите в него."); }
      String token=newToken(); db.update("INSERT INTO makon_sessions(token_hash,user_id,expires_at) VALUES(?,?,now()+interval '30 days')",hash(token),id);
      return new AuthResult(201,Map.of("user",Map.of("id",id.toString(),"phone",phone)),sessionCookie(token));
    }
    if(action.equals("login")) {
      var rows=db.query("SELECT id,phone,password_hash FROM makon_users WHERE phone=?",(rs,n)->new String[]{rs.getObject("id").toString(),rs.getString("phone"),rs.getString("password_hash")},phone);
      if(rows.isEmpty()||!verify(password,rows.get(0)[2])) throw new ApiException(401,"Неверный номер телефона или пароль.");
      String token=newToken(); db.update("INSERT INTO makon_sessions(token_hash,user_id,expires_at) VALUES(?,?,now()+interval '30 days')",hash(token),UUID.fromString(rows.get(0)[0]));
      return new AuthResult(200,Map.of("user",Map.of("id",rows.get(0)[0],"phone",rows.get(0)[1])),sessionCookie(token));
    }
    throw new ApiException(400,"Неизвестное действие.");
  }

  private String hashPassword(String password) {
    byte[] salt=new byte[16]; RANDOM.nextBytes(salt);
    byte[] derived=SCrypt.generate(password.getBytes(StandardCharsets.UTF_8),salt,16384,8,1,64);
    return "scrypt$"+HexFormat.of().formatHex(salt)+"$"+HexFormat.of().formatHex(derived);
  }
  private boolean verify(String password,String encoded) {
    try {
      String[] bits=encoded.split("\\$"); if(bits.length!=3||!bits[0].equals("scrypt")) return false;
      byte[] actual=SCrypt.generate(password.getBytes(StandardCharsets.UTF_8),HexFormat.of().parseHex(bits[1]),16384,8,1,64);
      return MessageDigest.isEqual(actual,HexFormat.of().parseHex(bits[2]));
    } catch(RuntimeException e) { return false; }
  }
  private static String normalizePhone(Object value) { if(!(value instanceof String s))return ""; String d=s.replaceAll("\\D",""); if(d.matches("\\d{9}"))return "+998"+d; if(d.matches("998\\d{9}"))return "+"+d; return ""; }
  private static String newToken() { byte[] b=new byte[32]; RANDOM.nextBytes(b); return Base64.getUrlEncoder().withoutPadding().encodeToString(b); }
  private static String hash(String token) { try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException(e);} }
  private static String token(String cookie) { for(String item:cookie.split(";")){String s=item.trim();if(s.startsWith(COOKIE+"="))return s.substring(COOKIE.length()+1);} return ""; }
  private String sessionCookie(String token) { return COOKIE+"="+token+"; Path=/; HttpOnly; SameSite=Lax; Max-Age="+Duration.ofDays(30).toSeconds()+(Boolean.parseBoolean(System.getenv().getOrDefault("COOKIE_SECURE","false"))?"; Secure":""); }
  private String clearCookie() { return COOKIE+"=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"; }
  public record AuthResult(int status,Map<String,Object> body,String setCookie) {}
}
