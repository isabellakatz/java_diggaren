const apiUrl = "https://sverigesradio.se/topsy/direkt/srapi/164.mp3";
const audioElement = document.getElementById("P3-player");
const playButton = document.getElementById("play-button");
const playQuiz = document.getElementById("play-quiz");
const submitAnswer = document.getElementById("submit-answer");
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
   // setInterval(fetchCurrentSong, 5000); // hämtar current song var 5:e sekund
    fetchCurrentSong();
    playQuiz.style.display = "none";
    submitAnswer.style.display = "block";
});

async function fetchCurrentSong() {
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

        // Starta quizet
        startQuiz();

    } catch (error) {
        console.error('Fel vid hämtning av spellista:', error);
    }
}

// Hämta Spotify Token
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
        }else{
            console.log("Du har access");
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error("Fel vid autentisering med Spotify:", error);
    }
}

async function fetchSpotifyRecommendations(currentSongTitle, currentSongArtist) {
    try {
        console.log("Startar funktionen fetchSpotifyRecommendations...");

        const token = await fetchSpotifyToken();
        if (!token) {
            console.error("Ingen token.");
            return [];
        }
        console.log("Token:", token);

        // Sök efter låtar från samma artist
        const searchUrl = `https://api.spotify.com/v1/search?q=artist:${encodeURIComponent(currentSongArtist)}&type=track&limit=10`;
        console.log("Skickar till Spotify:", searchUrl);

        const searchResponse = await fetch(searchUrl, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!searchResponse.ok) {
            console.error("Fel vid hämtning av låtar:", searchResponse.status);
            return [];
        }

        const searchData = await searchResponse.json();
        console.log("Data mottagen:", searchData);

        // Hämta låtar från samma artist
        const artistTracks = searchData.tracks.items.map(track => ({
            title: track.name,
            artist: track.artists[0]?.name || "Okänd artist"
        }));
        console.log("Låtar från samma artist:", artistTracks);

        // Kontrollera om vi fick några resultat
        if (artistTracks.length === 0) {
            console.error("Inga låtar hittades.");
            return [];
        }

        // Filtrera bort den aktuella låten
        const filteredTracks = artistTracks.filter(track => track.title !== currentSongTitle);
        console.log("Filtrerade låtar (utan aktuell låt):", filteredTracks);

        // Ta bort dubbletter genom att skapa en unik lista baserat på både titel och artist
        const uniqueTracks = [];
        const trackTitles = new Set();

        filteredTracks.forEach(track => {
            const trackKey = `${track.title} - ${track.artist}`;
            if (!trackTitles.has(trackKey)) {
                trackTitles.add(trackKey);
                uniqueTracks.push(track);
            }
        });
        console.log("Unika låtar utan dubbletter:", uniqueTracks);

        // Lägg till den aktuella låten som ett alternativ om den inte redan finns i listan
        if (!uniqueTracks.some(track => track.title === currentSongTitle && track.artist === currentSongArtist)) {
            uniqueTracks.push({ title: currentSongTitle, artist: currentSongArtist });
        }
        console.log("Alla alternativ (inklusive aktuell låt):", uniqueTracks);

        // Begränsa till 4 alternativ och blanda dem
        const limitedOptions = uniqueTracks.slice(0, 4);
        console.log("Begränsade alternativ (max 4):", limitedOptions);

        shuffleArray(limitedOptions);
        console.log("Blandade alternativ:", limitedOptions);

        // Filtrera bort tomma alternativ innan vi returnerar
        const finalOptions = limitedOptions.filter(option => option.title && option.artist);
        console.log("Slutliga alternativ efter filtrering:", finalOptions);

        return finalOptions;

    } catch (error) {
        console.error("Fel vid hämtning av Spotify-låtar:", error);
        return [];
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
