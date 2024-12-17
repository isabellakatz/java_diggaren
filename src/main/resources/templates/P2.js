//function


const apiUrl = "https://api.sr.se/api/v2/channels?format=json";
const audioElement = document.getElementById("P2-player");
const playButton = document.getElementById("play-button");


// När man klickar på knappen för P2
playButton.addEventListener("click", () => {
    fetch(apiUrl) // Anropar Sveriges Radio API
        .then(response => response.json()) // Omvandlar svaret till JSON, eftersom svaret är i XML
        .then(data => {
            // Filtrera fram P1 (kanal-ID 163)
            const p2Channel = data.channels.find(channel => channel.id === 163);


            if (p2Channel && p2Channel.liveaudio.url) {
                // Hämta URL till P2-ljudströmmen
                const streamUrl = p2Channel.liveaudio.url;
                console.log("P2-ström URL:", streamUrl);


                // Spela upp ljudströmmen
                audioElement.src = streamUrl;
                audioElement.play();
            } else {
                console.error("Kunde inte hitta ljudströmmen för P2.");
            }
        })
        .catch(error => {
            console.error("Fel vid API-anrop:", error);
        });
});


// När man klickar på knappen
document.getElementById("play-button").addEventListener("click", function() {
    const audioPlayer = document.getElementById("P2-player");


    // Visa ljudspelaren när knappen trycks
    audioPlayer.style.display = "block"; // Gör ljudspelaren synlig


    // Sätt källan till Sveriges Radio P1-ljudström
    const P2StreamURL = "https://audio.sr.se/sida/streaming/163.mp3"; // Direkt MP3-länk
    audioPlayer.src = P2StreamURL;


    // Försök att spela upp ljudet
    audioPlayer.play().catch(error => {
        console.error("Autoplay blockerades av webbläsaren:", error);
    });
});


// När man klickar på knappen
document.getElementById("play-button-p2").addEventListener("click", function() {
    const audioPlayer = document.getElementById("P2-player");
    const playButton = document.getElementById("play-button-p2");


    // Dölj knappen när den klickas
    playButton.style.display = "none";


    // Visa ljudspelaren när knappen trycks
    audioPlayer.style.display = "block"; // Gör ljudspelaren synlig


    // Sätt källan till Sveriges Radio P1-ljudström
    const P2StreamURL = "https://audio.sr.se/sida/streaming/163.mp3"; // Direkt MP3-länk
    audioPlayer.src = P2StreamURL;


    // Försök att spela upp ljudet
    audioPlayer.play().catch(error => {
        console.error("Autoplay blockerades av webbläsaren:", error);
    });
});
