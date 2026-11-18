package com.uyol.backend;

import java.util.Map;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {
  private final AccountService accounts; private final UserDataService userData;
  public ApiController(AccountService accounts,UserDataService userData){this.accounts=accounts;this.userData=userData;}
  @GetMapping("/api/health") ResponseEntity<?> health(){return ResponseEntity.ok(Map.of("status","ok","database","connected"));}
  @GetMapping("/api/auth") ResponseEntity<?> getAuth(@RequestHeader(value="Cookie",required=false) String cookie){return authResponse(accounts.account("GET",Map.of(),cookie==null?"":cookie));}
  @org.springframework.web.bind.annotation.PostMapping("/api/auth") ResponseEntity<?> postAuth(@RequestBody Map<String,Object> body,@RequestHeader(value="Cookie",required=false) String cookie){return authResponse(accounts.account("POST",body,cookie==null?"":cookie));}
  @DeleteMapping("/api/auth") ResponseEntity<?> deleteAuth(@RequestHeader(value="Cookie",required=false) String cookie){return authResponse(accounts.account("DELETE",Map.of(),cookie==null?"":cookie));}
  private ResponseEntity<?> authResponse(AccountService.AuthResult result){var response=ResponseEntity.status(result.status()).cacheControl(CacheControl.noStore());if(result.setCookie()!=null)response.header("Set-Cookie",result.setCookie());return response.body(result.body());}
  @GetMapping("/api/user-data") ResponseEntity<?> getUserData(@RequestHeader(value="Cookie",required=false) String cookie){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(userData.handle("GET",cookie==null?"":cookie,Map.of()));}
  @PutMapping("/api/user-data") ResponseEntity<?> putUserData(@RequestBody Map<String,Object> body,@RequestHeader(value="Cookie",required=false) String cookie){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(userData.handle("PUT",cookie==null?"":cookie,body));}
  @DeleteMapping("/api/user-data") ResponseEntity<?> deleteUserData(@RequestBody Map<String,Object> body,@RequestHeader(value="Cookie",required=false) String cookie){return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(userData.handle("DELETE",cookie==null?"":cookie,body));}
}
