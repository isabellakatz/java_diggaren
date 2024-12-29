const apiUrl = "https://sverigesradio.se/topsy/direkt/srapi/164.mp3";
const audioElement = document.getElementById("P3-player");
const playButton = document.getElementById("play-button");
const playQuiz = document.getElementById("play-quiz");
const clientId = "0dfbaadbec2b44ccbd420b22d5141ff3";
const clientSecret = "5f9e7c3ce53246f591a42dbc2d648f4f";
let currentSongTitle = "";
let currentSongArtist = "";

document.getElementById("play-button").addEventListener("click", function() {
    audioElement.src = apiUrl;
    playButton.style.display = "none";
    audioElement.style.display = "block";
    audioElement.play()
        .then(() => console.log("Spelar ljudströmmen"))
        .catch(error => console.error("Fel vid uppspelning:", error));
});

document.getElementById("play-quiz").addEventListener("click", function() {
    fetchPlaylist();
});

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

        // Hämta den nuvarande låten
        const currentSong = xmlDoc.getElementsByTagName("song")[0];
        currentSongTitle = currentSong ? currentSong.getElementsByTagName("title")[0].textContent : "";
        currentSongArtist = currentSong ? currentSong.getElementsByTagName("artist")[0].textContent : "";

        // Uppdatera UI för den nuvarande låten (inte visad för användaren)
        // const currentSongContainer = document.querySelector(".current-song");
        // currentSongContainer.textContent = `Nu spelas: ${currentSongTitle} - ${currentSongArtist}`;

        // Starta quizet
        startQuiz();

    } catch (error) {
        console.error('Fel vid hämtning av spellista:', error);
    }
}

async function fetchSpotifyToken() {
    const tokenUrl = "https://accounts.spotify.com/api/token";
    const credentials = btoa(`${clientId}:${clientSecret}`);

    try {
        const response = await fetch(tokenUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${credentials}`
            },
            body: "grant_type=client_credentials"
        });

        if (!response.ok) {
            throw new Error("Kunde inte hämta Spotify-token.");
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Fel vid autentisering med Spotify:", error);
    }
}

async function fetchSpotifyRecommendations(currentSongTitle, currentSongArtist) {
    try {
        const token = await fetchSpotifyToken();
        if (!token) return;

        const searchUrl = `https://api.spotify.com/v1/search?q=track:${encodeURIComponent(currentSongTitle)}%20artist:${encodeURIComponent(currentSongArtist)}&type=track&limit=1`;

        const searchResponse = await fetch(searchUrl, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const searchData = await searchResponse.json();
        const trackId = searchData.tracks.items[0]?.id;

        if (!trackId) {
            console.error("Ingen låt hittades för rekommendationer.");
            return [];
        }

        const recUrl = `https://api.spotify.com/v1/recommendations?seed_tracks=${trackId}&limit=3`;
        const recResponse = await fetch(recUrl, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const recData = await recResponse.json();
        return recData.tracks.map(track => ({
            title: track.name,
            artist: track.artists[0].name
        }));
    } catch (error) {
        console.error("Fel vid hämtning av rekommendationer:", error);
    }
}

// Starta quiz
async function startQuiz() {
    // Hämta rekommendationer baserat på den aktuella låten
    const recommendations = await fetchSpotifyRecommendations(currentSongTitle, currentSongArtist);

    if (recommendations.length === 0) {
        console.error("Kunde inte skapa alternativ för quizet.");
        return;
    }

    // Lägg till rätt låt i alternativen
    const allOptions = [...recommendations, { title: currentSongTitle, artist: currentSongArtist }];
    shuffleArray(allOptions); // Blanda alternativen

    // Visa alternativen i quizet
    const quizOptionsContainer = document.getElementById("quiz-options");
    quizOptionsContainer.innerHTML = "";

    allOptions.forEach((option, index) => {
        const optionHTML = `
            <label>
                <input type="radio" name="quiz-option" value="${option.title} - ${option.artist}">
                ${option.title} - ${option.artist}
            </label><br>
        `;
        quizOptionsContainer.innerHTML += optionHTML;
    });

    const questionContainer = document.getElementById("quiz-question");
    questionContainer.textContent = "Vilken låt spelas just nu?";

}

// Blanda alternativ
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Skicka svar och ge feedback
document.getElementById("submit-answer").addEventListener("click", function() {
    const selectedOption = document.querySelector('input[name="quiz-option"]:checked');
    const feedbackContainer = document.getElementById("quiz-feedback");

    if (!selectedOption) {
        feedbackContainer.textContent = "Välj ett alternativ innan du skickar in!";
        return;
    }

    const correctAnswer = `${currentSongTitle} - ${currentSongArtist}`;
    if (selectedOption.value === correctAnswer) {
        feedbackContainer.textContent = "Rätt svar! Bra jobbat!";
    } else {
        feedbackContainer.textContent = `Fel svar. Rätt svar är: ${correctAnswer}`;
    }
});
