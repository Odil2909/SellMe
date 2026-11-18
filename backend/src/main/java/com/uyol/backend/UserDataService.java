package com.uyol.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class UserDataService {
  private static final Set<String> KEYS=Set.of("profile","favorites","compare","valuations","settings","listingDraft","listingStep","listings","locale");
  private final JdbcTemplate db; private final ObjectMapper json; private final AccountService accounts;
  public UserDataService(JdbcTemplate db,ObjectMapper json,AccountService accounts){this.db=db;this.json=json;this.accounts=accounts;}
  public Map<String,Object> handle(String method,String cookie,Map<String,Object> body) {
    Map<String,Object> user=accounts.user(cookie); if(user==null)throw new ApiException(401,"Войдите в аккаунт, чтобы работать с сохранёнными данными."); UUID id=UUID.fromString(user.get("id").toString());
    if(method.equals("GET")){var out=new java.util.LinkedHashMap<String,Object>();db.query("SELECT data_key,data::text AS value FROM makon_user_data WHERE user_id=?",rs->{try{out.put(rs.getString("data_key"),json.readValue(rs.getString("value"),Object.class));}catch(Exception e){throw new IllegalStateException(e);}},id);return Map.of("data",out);}
    if(!method.equals("PUT")&&!method.equals("DELETE"))throw new ApiException(405,"Метод не поддерживается.");
    Object keyValue=body.get("key");String key=keyValue instanceof String s?s:"";if(!KEYS.contains(key))throw new ApiException(400,"Неизвестный тип пользовательских данных.");
    if(method.equals("DELETE")){db.update("DELETE FROM makon_user_data WHERE user_id=? AND data_key=?",id,key);return Map.of("ok",true);}
    try { String data=json.writeValueAsString(body.get("value")); if(data.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>250*1024)throw new ApiException(413,"Размер одного элемента данных не должен превышать 250 КБ."); db.update("INSERT INTO makon_user_data(user_id,data_key,data) VALUES(?,?,?::jsonb) ON CONFLICT(user_id,data_key) DO UPDATE SET data=excluded.data,updated_at=now()",id,key,data);return Map.of("ok",true); }
    catch(ApiException e){throw e;}catch(Exception e){throw new ApiException(400,"Данные имеют неверный формат.");}
  }
}
