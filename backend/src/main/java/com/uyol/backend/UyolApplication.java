package com.uyol.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@SpringBootApplication
public class UyolApplication {
  public static void main(String[] args) { SpringApplication.run(UyolApplication.class, args); }
}

@Component
class StartupMessage {
  private final int port;
  StartupMessage(@Value("${server.port:4178}") int port) { this.port = port; }

  @EventListener(ApplicationReadyEvent.class)
  void ready() { System.out.println("Java API готов. Адрес: http://127.0.0.1:" + port); }
}
