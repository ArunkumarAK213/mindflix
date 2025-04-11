const API_KEY = "YOUR_API_KEY"; 
const BASE_URL = "https://api.themoviedb.org/3";
let allMovies = [];

function searchMovies() {
  const moodInput = document.getElementById("moodInput").value;
  if (!moodInput.trim()) return;

  // Basic keyword detection for genres
  const keywords = moodInput.toLowerCase();
  let genreQuery = "";

  if (keywords.includes("love") || keywords.includes("romantic")) genreQuery = "romance";
  else if (keywords.includes("funny") || keywords.includes("comedy")) genreQuery = "comedy";
  else if (keywords.includes("sad") || keywords.includes("emotional")) genreQuery = "drama";
  else if (keywords.includes("action") || keywords.includes("fight")) genreQuery = "action";
  else if (keywords.includes("horror") || keywords.includes("scary")) genreQuery = "horror";
  else if (keywords.includes("thrill") || keywords.includes("suspense")) genreQuery = "thriller";
  else genreQuery = keywords; // fallback to user input

  fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${genreQuery}`)
    .then(res => res.json())
    .then(data => {
      allMovies = data.results;
      displayMovies(allMovies);
    })
    .catch(err => console.error("Error:", err));
}

function displayMovies(movies) {
  const resultsContainer = document.getElementById("movieResults");
  resultsContainer.innerHTML = "";

  if (!movies.length) {
    resultsContainer.innerHTML = "<p>No movies found for this mood. Try another!</p>";
    return;
  }

  movies.forEach(movie => {
    const {
      title,
      poster_path,
      overview,
      release_date,
      vote_average,
      id,
      original_language
    } = movie;

    const movieCard = document.createElement("div");
    movieCard.classList.add("movie");

    movieCard.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${poster_path}" alt="${title}">
      <h3>${title}</h3>
      <p>${overview?.slice(0, 100) || "No description"}...</p>
      <p><strong>⭐ ${vote_average || "?"}</strong> | ${release_date?.slice(0, 4) || "?"} | 🌍 ${original_language.toUpperCase()}</p>
      <div class="actions">
        <button onclick="getTrailer(${id})">▶ Trailer</button>
        <span class="fav ${isFavorite(id) ? "saved" : ""}" onclick="toggleFavorite(${id}, this)">❤️</span>
      </div>
    `;

    resultsContainer.appendChild(movieCard);
  });
}

function getTrailer(movieId) {
  fetch(`${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`)
    .then(res => res.json())
    .then(data => {
      const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube");
      if (trailer) {
        window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
      } else {
        alert("No trailer available for this movie.");
      }
    });
}

// Favorites using localStorage
function toggleFavorite(id, el) {
  let favs = JSON.parse(localStorage.getItem("favorites")) || [];
  if (favs.includes(id)) {
    favs = favs.filter(f => f !== id);
    el.classList.remove("saved");
  } else {
    favs.push(id);
    el.classList.add("saved");
  }
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function isFavorite(id) {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  return favs.includes(id);
}

// Filter by rating
function applyFilter() {
  const rating = document.getElementById("ratingFilter").value;
  if (!rating) {
    displayMovies(allMovies);
    return;
  }
  const filtered = allMovies.filter(m => m.vote_average >= parseFloat(rating));
  displayMovies(filtered);
}
