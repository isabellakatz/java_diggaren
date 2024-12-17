

const apiUrl = "https://api.sr.se/api/v2/channels?format=json";
const audioElement = document.getElementById("P3-player");
const playButton = document.getElementById("play-button");
const spelLista = document.getElementById("playlist-button");

// När man klickar på knappen
playButton.addEventListener("click", () => {
    fetch(apiUrl) // Anropar Sveriges Radio API
        .then(response => response.json()) // Omvandlar svaret till JSON, eftersom svaret är i XML
        .then(data => {
            // Filtrera fram P3 (kanal-ID 164)
            const p3Channel = data.channels.find(channel => channel.id === 164);

            if (p3Channel && p3Channel.liveaudio.url) {
                // Hämta URL till P3-ljudströmmen
                const streamUrl = p3Channel.liveaudio.url;
                console.log("P3-ström URL:", streamUrl);

                // Spela upp ljudströmmen
                audioElement.src = streamUrl;
                audioElement.play();
            } else {
                console.error("Kunde inte hitta ljudströmmen för P3.");
            }
        })
        .catch(error => {
            console.error("Fel vid API-anrop:", error);
        });
});

// När man klickar på knappen
document.getElementById("play-button").addEventListener("click", function() {
    const audioPlayer = document.getElementById("P3-player");

    // Visa ljudspelaren när knappen trycks
    audioPlayer.style.display = "block"; // Gör ljudspelaren synlig

    // Sätt källan till Sveriges Radio P1-ljudström
    const P3StreamURL = "https://sverigesradio.se/topsy/direkt/srapi/164.mp3"; // Direkt MP3-länk
    audioPlayer.src = P3StreamURL;

    // Försök att spela upp ljudet
    audioPlayer.play().catch(error => {
        console.error("Autoplay blockerades av webbläsaren:", error);
    });
});

// När man klickar på knappen
document.getElementById("play-button").addEventListener("click", function() {
    const audioPlayer = document.getElementById("P3-player");
    const playButton = document.getElementById("play-button");

    // Dölj knappen när den klickas
    playButton.style.display = "none";

    // Visa ljudspelaren när knappen trycks
    audioPlayer.style.display = "block"; // Gör ljudspelaren synlig

    // Sätt källan till Sveriges Radio P1-ljudström
    const P3StreamURL = "https://sverigesradio.se/topsy/direkt/srapi/164.mp3"; // Direkt MP3-länk
    audioPlayer.src = P3StreamURL;

    // Försök att spela upp ljudet
    audioPlayer.play().catch(error => {
        console.error("Autoplay blockerades av webbläsaren:", error);
    });
});

spelLista.addEventListener("click", () => {
    fetchPlaylist();
})

async function fetchPlaylist() {
    try {
        // Hämta spellista från API:et
        const response = await fetch("https://api.sr.se/api/v2/playlists/rightnow?channelid=164");

        if (!response.ok) {
            throw new Error("HTTP-status: " + response.status);
        }

        // Läsa svaret som text (XML)
        const textResponse = await response.text();

        // Konvertera XML till JavaScript-objekt
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textResponse, "application/xml");

        // Hämta spellistan från XML-dokumentet
        const songs = xmlDoc.getElementsByTagName("song");
        const playlistContainer = document.querySelector(".playlist");

        // Töm container för att visa ny spellista
        playlistContainer.innerHTML = '';

        if (songs.length > 0) {
            // Skapa en lista av låtar
            const ul = document.createElement("ul");

            Array.from(songs).forEach(song => {
                const title = song.getElementsByTagName("title")[0].textContent;
                const artist = song.getElementsByTagName("artist")[0].textContent;

                const li = document.createElement("li");
                li.textContent = `${title} - ${artist}`;
                ul.appendChild(li);
            });

            // Lägg till listan till container
            playlistContainer.appendChild(ul);
        } else {
            playlistContainer.textContent = "Ingen låtlista hittades eller spellistan är tom.";
        }

    } catch (error) {
        console.error('Fel vid hämtning av spellista:', error);
        alert('Det uppstod ett problem vid hämtning av spellistan.');
    }
}