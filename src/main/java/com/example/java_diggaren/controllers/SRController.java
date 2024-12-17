package com.example.java_diggaren.controllers;

import com.example.java_diggaren.services.SRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController //ansvarar för att hantera HTTP-anrop från frontend och hämta datan från SR
@RequestMapping("/api")
public class SRController {
    @Autowired
    private SRService srService;

    @GetMapping("/p3") //
    public String getP3Data() {
        return srService.fetchP3Data().toString();
    }
}
