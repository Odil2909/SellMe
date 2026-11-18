package com.uyol.backend;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
public class GeocodeController {
  private static final ConcurrentHashMap<String,Long> LAST_REQUEST=new ConcurrentHashMap<>();
  private static volatile long lastGlobalRequest=0;
  private final ObjectMapper json; private final HttpClient client=HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
  public GeocodeController(ObjectMapper json){this.json=json;}
  @GetMapping("/api/geocode") ResponseEntity<?> geocode(@RequestParam(required=false) String q,@RequestHeader(value="X-Forwarded-For",required=false) String forwarded,@RequestHeader(value="X-Real-IP",required=false) String realIp){
    if(q==null||q.trim().isEmpty()||q.trim().length()>300)throw new ApiException(400,"Введите адрес (до 300 символов).");String query=q.trim();String ip=forwarded==null?(realIp==null?"unknown":realIp):forwarded.split(",")[0].trim();long now=System.currentTimeMillis();Long prev=LAST_REQUEST.put(ip,now);if(prev!=null&&now-prev<1000)throw new ApiException(429,"Подождите секунду перед следующим поиском адреса.");
    synchronized(GeocodeController.class){long wait=1000-(now-lastGlobalRequest);if(wait>0)try{Thread.sleep(wait);}catch(InterruptedException e){Thread.currentThread().interrupt();}lastGlobalRequest=System.currentTimeMillis();}
    try{String url="https://nominatim.openstreetmap.org/search?q="+URLEncoder.encode(query+", Uzbekistan",StandardCharsets.UTF_8)+"&format=jsonv2&limit=1&countrycodes=uz";var request=HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(8)).header("User-Agent","uy-ol-property-search/1.0").header("Accept-Language","ru,en").GET().build();var response=client.send(request,HttpResponse.BodyHandlers.ofString());if(response.statusCode()<200||response.statusCode()>=300)throw new ApiException(502,"Сервис поиска адреса временно недоступен.");var matches=json.readValue(response.body(),com.fasterxml.jackson.databind.JsonNode.class);if(!matches.isArray()||matches.isEmpty())throw new ApiException(404,"Адрес не найден. Уточните адрес или выберите точку на карте.");var first=matches.get(0);return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(Map.of("lat",first.path("lat").asDouble(),"lng",first.path("lon").asDouble(),"displayName",first.path("display_name").asText()));}catch(ApiException e){throw e;}catch(Exception e){throw new ApiException(502,"Не удалось выполнить поиск адреса.");}
  }
}
