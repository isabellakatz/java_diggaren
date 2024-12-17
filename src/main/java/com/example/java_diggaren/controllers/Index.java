package com.example.java_diggaren.controllers;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class Index {

    @GetMapping("/")
    public String index() {
        return "RadioKanaler";
    }

    @GetMapping ("/P1.html")
    public String getP1(){
        return "P1";
    }

    @GetMapping ("/P2.html")
    public String getP2(){
        return "P2";
    }

    @GetMapping("/P3.html")
    public String getP3(){
        return "P3";
    }

    @GetMapping("/P4.html")
    public String getP4(){
        return "P4";
    }
}
