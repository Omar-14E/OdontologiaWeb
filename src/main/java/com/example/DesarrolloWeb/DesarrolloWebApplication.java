package com.example.DesarrolloWeb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling 
public class DesarrolloWebApplication {

    public static void main(String[] args) {
        SpringApplication.run(DesarrolloWebApplication.class, args);
    }
}