package com.uyol.backend;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class ListingController {
  private static final Logger log=LoggerFactory.getLogger(ListingController.class);
  private static final Set<String> DEALS=Set.of("Продажа","Аренда","Посуточно");
  private static final Set<String> CATEGORIES=Set.of("Квартира","Дом","Земля","Гараж","Коммерция","Офис","Склад");
  private static final ConcurrentHashMap<String,Window> SUBMISSIONS=new ConcurrentHashMap<>();
  private final JdbcTemplate db; private final ObjectMapper json; private final AccountService accounts; private final Path uploads;
  public ListingController(JdbcTemplate db,ObjectMapper json,AccountService accounts,@Value("${uyol.data-dir:./server-data}") String dataDir){this.db=db;this.json=json;this.accounts=accounts;this.uploads=Path.of(dataDir).toAbsolutePath().resolve("uploads");}

  @GetMapping("/api/listings") ResponseEntity<?> list(){var result=db.query("SELECT data::text FROM makon_listings ORDER BY created_at DESC",(rs,n)->{try{return json.readValue(rs.getString(1),Object.class);}catch(Exception e){throw new IllegalStateException(e);}});return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(result);}

  @PostMapping(value="/api/listings",consumes="multipart/form-data")
  ResponseEntity<?> create(@RequestParam("listing") String listingText,@RequestParam(value="media",required=false) java.util.List<MultipartFile> media,@RequestHeader(value="Cookie",required=false) String cookie,@RequestHeader(value="X-Forwarded-For",required=false) String forwardedFor,@RequestHeader(value="X-Real-IP",required=false) String realIp){
    String ip=forwardedFor!=null?forwardedFor.split(",")[0].trim():realIp==null?"unknown":realIp;
    if(limited(ip,10,3600000))throw new ApiException(429,"Слишком много объявлений. Попробуйте позже.");
    Map<String,Object> owner=accounts.user(cookie==null?"":cookie);if(owner==null)throw new ApiException(401,"Войдите в аккаунт, чтобы опубликовать объявление.");
    Map<String,Object> input;try{input=json.readValue(listingText,new TypeReference<>(){});}catch(Exception e){throw new ApiException(400,"Не удалось прочитать данные объявления.");}
    Map<String,Object> listing=validate(input);var photos=new ArrayList<String>();var stored=new ArrayList<Path>();
    try{
      if(media!=null&&media.size()>10)throw new ApiException(400,"Можно добавить не более 10 фото или видео.");
      Files.createDirectories(uploads);
      if(media!=null)for(MultipartFile file:media){if(file.isEmpty())continue;String ext=validExtension(file);if(ext.isBlank())throw new ApiException(415,"Поддерживаются только PNG, JPG, WebP, GIF, MP4, MOV и WebM.");long max=Set.of(".mp4",".mov",".webm").contains(ext)?10L*1024*1024:15L*1024*1024;if(file.getSize()>max)throw new ApiException(413,ext.startsWith(".mp")||ext.equals(".mov")||ext.equals(".webm")?"Размер каждого видео не должен превышать 10 МБ.":"Размер фотографии не должен превышать 15 МБ.");String name=UUID.randomUUID()+ext;Path target=uploads.resolve(name);file.transferTo(target);stored.add(target);photos.add("/uploads/"+name);}
      UUID id=UUID.randomUUID();var result=new java.util.LinkedHashMap<String,Object>(listing);result.put("id",id.toString());result.put("currency","USD");result.put("features",java.util.List.of());result.put("photos",photos);result.put("date",LocalDate.now().toString());result.put("status","Новое объявление");result.put("contact",Map.of("name",listing.get("name"),"role","Собственник","phone",listing.get("phone")));result.remove("name");result.remove("phone");
      db.update("INSERT INTO makon_listings(id,data,owner_user_id) VALUES(?,?::jsonb,?)",id,json.writeValueAsString(result),UUID.fromString(owner.get("id").toString()));
      log.info("Новое объявление добавлено в каталог.");
      return ResponseEntity.status(201).cacheControl(CacheControl.noStore()).body(result);
    }catch(ApiException e){delete(stored);throw e;}catch(Exception e){delete(stored);throw new ApiException(500,"Не удалось опубликовать объявление.");}
  }

  private Map<String,Object> validate(Map<String,Object> input){
    var out=new java.util.LinkedHashMap<String,Object>();
    for(String[] field:new String[][]{{"deal","тип сделки","30"},{"category","тип недвижимости","30"},{"city","город","100"},{"district","район","100"},{"address","адрес","250"},{"condition","состояние","80"},{"title","заголовок","100"},{"description","описание","4000"},{"name","имя","100"},{"phone","телефон","30"}}){String key=field[0];Object v=input.get(key);if(!(v instanceof String s))throw new ApiException(400,"Поле «"+field[1]+"» заполнено неверно.");String value=s.replace("\u0000","").trim();if(value.isEmpty()||value.length()>Integer.parseInt(field[2]))throw new ApiException(400,"Проверьте поле «"+field[1]+"» (максимум "+field[2]+" символов).");out.put(key,value);}
    if(!DEALS.contains(out.get("deal"))||!CATEGORIES.contains(out.get("category")))throw new ApiException(400,"Выберите тип сделки и недвижимости из списка.");
    for(String key:new String[]{"area","price","lat","lng"}){double n=number(input.get(key),key);if((key.equals("area")||key.equals("price"))&&n<=0)throw new ApiException(400,"Проверьте цену, площадь и координаты объекта.");if(key.equals("lat")&&(n< -90||n>90)||key.equals("lng")&&(n< -180||n>180))throw new ApiException(400,"Проверьте цену, площадь и координаты объекта.");out.put(key,n);}
    for(String key:new String[]{"rooms","floor","floors","plot"})if(input.get(key)!=null&&!input.get(key).toString().isBlank()){double n=number(input.get(key),key);if(n<0)throw new ApiException(400,"Проверьте числовое поле «"+key+"».");out.put(key,n);}
    String digits=out.get("phone").toString().replaceAll("\\D","");if(!digits.matches("(998)?\\d{9}"))throw new ApiException(400,"Укажите корректный номер телефона Узбекистана.");
    return out;
  }
  private static double number(Object value,String field){try{double n=Double.parseDouble(String.valueOf(value));if(!Double.isFinite(n))throw new NumberFormatException();return n;}catch(Exception e){throw new ApiException(400,"Проверьте числовое поле «"+field+"».");}}
  private static String validExtension(MultipartFile file)throws Exception{String name=file.getOriginalFilename()==null?"":file.getOriginalFilename().toLowerCase();String type=file.getContentType()==null?"":file.getContentType().toLowerCase();byte[] b=file.getBytes();String ext=name.lastIndexOf('.')<0?"":name.substring(name.lastIndexOf('.'));boolean ok=switch(ext){case ".png"->type.equals("image/png")&&b.length>=8&&(b[0]&255)==137&&b[1]==80&&b[2]==78&&b[3]==71;case ".jpg",".jpeg"->type.equals("image/jpeg")&&b.length>=3&&(b[0]&255)==255&&(b[1]&255)==216&&(b[2]&255)==255;case ".webp"->type.equals("image/webp")&&b.length>=12&&new String(b,0,4).equals("RIFF")&&new String(b,8,4).equals("WEBP");case ".gif"->type.equals("image/gif")&&new String(b,0,Math.min(6,b.length)).matches("GIF8[79]a");case ".mp4"->type.equals("video/mp4")&&b.length>=8&&new String(b,4,4).equals("ftyp");case ".mov"->type.equals("video/quicktime")&&b.length>=8&&new String(b,4,4).equals("ftyp");case ".webm"->type.equals("video/webm")&&b.length>=4&&(b[0]&255)==0x1a&&(b[1]&255)==0x45&&(b[2]&255)==0xdf&&(b[3]&255)==0xa3;default->false;};return ok?ext:"";}
  private static boolean limited(String key,int limit,long interval){long now=System.currentTimeMillis();Window w=SUBMISSIONS.compute(key,(k,v)->v==null||now-v.start>=interval?new Window(now,1):new Window(v.start,v.count+1));return w.count>limit;}
  private static void delete(java.util.List<Path> paths){for(Path path:paths)try{Files.deleteIfExists(path);}catch(Exception ignored){}}
  private record Window(long start,int count){}
}
