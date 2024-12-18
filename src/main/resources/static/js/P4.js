

const apiUrl = "https://api.sr.se/api/v2/channels?format=json";
const audioElement = document.getElementById("P4-player");
const playButton = document.getElementById("play-button");
const spelLista = document.getElementById("playlist-button");


// När man klickar på knappen
playButton.addEventListener("click", () => {
    fetch(apiUrl) // Anropar Sveriges Radio API
        .then(response => response.json()) // Omvandlar svaret till JSON, eftersom svaret är i XML
        .then(data => {
            // Filtrera fram P4-malmö (kanal-ID 297)
            const p4Channel = data.channels.find(channel => channel.id === 207);

            if (p4Channel && p4Channel.liveaudio.url) {
                // Hämta URL till P4-ljudströmmen
                const streamUrl = p4Channel.liveaudio.url;
                console.log("P4-ström URL:", streamUrl);

                // Spela upp ljudströmmen
                audioElement.src = streamUrl;
                audioElement.play();
            } else {
                console.error("Kunde inte hitta ljudströmmen för P4.");
            }
        })
        .catch(error => {
            console.error("Fel vid API-anrop:", error);
        });
});


spelLista.addEventListener("click", () => {
    fetchPlaylist();
})

async function fetchPlaylist() {
    try {
        // Hämta spellista från API:et
        const response = await fetch("https://api.sr.se/api/v2/playlists/rightnow?channelid=207");

        if (!response.ok) {
            throw new Error("HTTP-status: " + response.status);
        }

        // Läsa svaret som text (XML)
        const textResponse = await response.text();

        // Konvertera XML till JavaScript-objekt
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textResponse, "application/xml");

        // Hämta den senaste låten
        const previousSong = xmlDoc.getElementsByTagName("previoussong")[0];
        const previousSongTitle = previousSong ? previousSong.getElementsByTagName("title")[0].textContent : "";
        const previousSongArtist = previousSong ? previousSong.getElementsByTagName("artist")[0].textContent : "";

        // Hämta den nuvarande låten
        const currentSong = xmlDoc.getElementsByTagName("song")[0];
        const currentSongTitle = currentSong ? currentSong.getElementsByTagName("title")[0].textContent : "";
        const currentSongArtist = currentSong ? currentSong.getElementsByTagName("artist")[0].textContent : "";

        // Uppdatera UI för den senaste och nuvarande låten
        const previousSongContainer = document.querySelector(".previous-song");
        const currentSongContainer = document.querySelector(".current-song");

        previousSongContainer.textContent = `Tidigare spelad: ${previousSongTitle} - ${previousSongArtist}`;
        currentSongContainer.textContent = `Nu spelas: ${currentSongTitle} - ${currentSongArtist}`;

        // Hämta spellistan om du vill visa hela spellistan också
        const songs = xmlDoc.getElementsByTagName("song");
        const playlistContainer = document.querySelector(".playlist");

        playlistContainer.innerHTML = '';

        if (songs.length > 0) {
            const ul = document.createElement("ul");
            Array.from(songs).forEach(song => {
                const title = song.getElementsByTagName("title")[0].textContent;
                const artist = song.getElementsByTagName("artist")[0].textContent;

                const li = document.createElement("li");
                li.textContent = `${title} - ${artist}`;
                ul.appendChild(li);
            });
            playlistContainer.appendChild(ul);
        }

    } catch (error) {
        console.error('Fel vid hämtning av spellista:', error);
    }
}