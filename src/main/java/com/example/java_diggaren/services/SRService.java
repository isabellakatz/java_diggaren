package com.example.java_diggaren.services;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.channels.Channel;

@Service
public class SRService {
    private final String SR_API_URL = "https://api.sr.se/api/v2/channels?name=p3&format=json";

    public Channel fetchP3Data() {
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(SR_API_URL, Channel.class);
    }
}
