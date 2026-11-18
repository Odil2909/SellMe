package com.uyol.backend;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class DataSourceConfig {
  @Bean @Primary DataSource dataSource(@Value("${DATABASE_URL:}") String databaseUrl,@Value("${DATABASE_USERNAME:uyol}") String username,@Value("${DATABASE_PASSWORD:uyol}") String password,@Value("${DB_POOL_SIZE:10}") int poolSize){
    String url=databaseUrl.isBlank()?"jdbc:postgresql://localhost:5433/uyol":databaseUrl.trim();String dbUser=username,dbPassword=password;
    try {
      if(url.startsWith("postgres://")||url.startsWith("postgresql://")){
        java.net.URI uri=java.net.URI.create(url);String info=uri.getUserInfo();if(info!=null){String[] parts=info.split(":",2);dbUser=java.net.URLDecoder.decode(parts[0],java.nio.charset.StandardCharsets.UTF_8);if(parts.length>1)dbPassword=java.net.URLDecoder.decode(parts[1],java.nio.charset.StandardCharsets.UTF_8);}
        String authority=uri.getRawAuthority();int at=authority.lastIndexOf('@');if(at>=0)authority=authority.substring(at+1);
        url="jdbc:postgresql://"+authority+uri.getRawPath()+(uri.getRawQuery()==null?"":"?"+uri.getRawQuery());
      }
    }catch(Exception e){throw new IllegalArgumentException("DATABASE_URL имеет неверный формат",e);}
    HikariConfig config=new HikariConfig();config.setJdbcUrl(url);config.setUsername(dbUser);config.setPassword(dbPassword);config.setMaximumPoolSize(poolSize);config.setPoolName("uyol-postgres");config.setConnectionTimeout(10000);return new HikariDataSource(config);
  }
}
