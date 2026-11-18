package com.uyol.backend;

import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MediaConfig implements WebMvcConfigurer {
  private final String dataDir;
  public MediaConfig(@Value("${uyol.data-dir:./server-data}") String dataDir){this.dataDir=dataDir;}
  @Override public void addResourceHandlers(ResourceHandlerRegistry registry){String location=Path.of(dataDir).toAbsolutePath().resolve("uploads").toUri().toString();registry.addResourceHandler("/uploads/**").addResourceLocations(location).setCachePeriod(31536000);}
}
