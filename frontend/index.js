// ===============================
// GLOBALS / DOM
// ===============================

const STRAPI_URL = (
  window.BOOK_DUCKS_CONFIG?.STRAPI_URL || "http://localhost:1337"
).replace(/\/+$/, "");
const API_URL = `${STRAPI_URL}/api`;

function getMediaUrl(media) {
  const url = media?.url;

  if (!url) return "";

  return url.startsWith("http://") || url.startsWith("https://")
    ? url
    : `${STRAPI_URL}${url}`;
}

const booksList = document.getElementById("booksContainer");
const registerForm = document.querySelector("#registerForm");
const loginForm = document.querySelector("#loginForm");
const bookDetailsContainer = document.getElementById("bookDetailsContainer");

const readingListContainer = document.getElementById("readingListContainer");
const ratedBooksContainer = document.getElementById("ratedBooksContainer");

const sortReadingList = document.getElementById("sortReadingList");
const sortRatedBooks = document.getElementById("sortRatedBooks");

const profileUsername = document.getElementById("profileUsername");
const profileLink = document.getElementById("profileLink");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");
const welcomeText = document.getElementById("welcomeText");
const authButtons = document.querySelector(".auth-buttons");

let books = [];

// ===============================
// BOOK LIST
// ===============================

async function fetchBooks() {
  try {
    const response = await axios.get(`${API_URL}/books?populate=*`);
    books = response.data.data;
    renderBooks(books);
  } catch (error) {
    console.error("Could not fetch books:", error.response?.data || error);
    alert("Kunde inte hämta böcker.");
  }
}

function renderBooks(booksArray) {
  if (!booksList) return;

  booksList.innerHTML = "";

  if (booksArray.length === 0) {
    booksList.innerHTML = `
      <div class="empty-state">
        <h2>Ingen bok hittades</h2>
        <p>Testa att söka på titel eller författare.</p>
      </div>
    `;
    return;
  }

  booksArray.forEach((book) => {
    const imageUrl = getMediaUrl(book.coverImage);

    const bookItem = document.createElement("div");
    bookItem.classList.add("book-card");

    bookItem.addEventListener("click", () => {
      window.location.href = `details.html?id=${book.documentId}`;
    });

    bookItem.innerHTML = `
      ${
        imageUrl
          ? `<img class="book-cover" src="${imageUrl}" alt="${book.title}" />`
          : `<div class="book-placeholder"></div>`
      }

      <h2>${book.title}</h2>
      <p><strong>Författare:</strong> ${book.author}</p>
      <p><strong>Antal sidor:</strong> ${book.pageCount}</p>
      <p><strong>Utgivningsdatum:</strong> ${book.publishedDate}</p>
    `;

    booksList.appendChild(bookItem);
  });
}

function searchBooks(event) {
  const searchText = event.target.value.toLowerCase();

  const filteredBooks = books.filter((book) => {
    const title = book.title?.toLowerCase() || "";
    const author = book.author?.toLowerCase() || "";

    return title.includes(searchText) || author.includes(searchText);
  });

  renderBooks(filteredBooks);
}

// ===============================
// BOOK DETAILS
// ===============================

async function fetchBookDetails() {
  if (!bookDetailsContainer) return;

  const params = new URLSearchParams(window.location.search);
  const bookId = params.get("id");

  if (!bookId) {
    bookDetailsContainer.innerHTML = "<p>Ingen bok hittades.</p>";
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/books/${bookId}?populate=*`);
    const book = response.data.data;

    renderBookDetails(book);
  } catch (error) {
    console.error(
      "Could not fetch book details:",
      error.response?.data || error,
    );
    bookDetailsContainer.innerHTML = "<p>Kunde inte hämta bokdetaljer.</p>";
  }
}

function renderBookDetails(book) {
  const imageUrl = getMediaUrl(book.coverImage);

  bookDetailsContainer.innerHTML = `
    <div class="details-cover-wrap">
      ${
        imageUrl
          ? `<img class="details-cover" src="${imageUrl}" alt="${book.title}" />`
          : `<div class="book-placeholder"></div>`
      }
    </div>

    <div class="details-info">
      <h1>${book.title}</h1>

      <p class="details-author">
        <strong>Författare:</strong> ${book.author}
      </p>

      <div class="details-meta">
        <span class="meta-pill">Antal sidor: ${book.pageCount} sidor</span>
        <span class="meta-pill">Utgivningsdatum: ${book.publishedDate}</span>
      </div>

      <p class="details-description">
        ${book.description || "Ingen beskrivning finns ännu."}
      </p>

      <div class="rating-preview">
        <p class="rating-label">Snittbetyg</p>

        <div class="rating-score">
          <span class="rating-star">★</span>
          <span id="averageRating" class="rating-number">-</span>
          <span class="rating-small">/ 10</span>
        </div>
      </div>
    </div>

    <div class="details-actions">
      <div class="action-panel">
        <h3>Spara till</h3>

        <button class="reading-list-btn" data-book-id="${book.documentId}">
          Att läsa-lista
        </button>
      </div>

      <div class="action-panel">
        <h3>Betygsätt boken</h3>
        <p class="rating-label">Din rating</p>

        <div class="rating-stars">
          <button data-rating="1">☆</button>
          <button data-rating="2">☆</button>
          <button data-rating="3">☆</button>
          <button data-rating="4">☆</button>
          <button data-rating="5">☆</button>
          <button data-rating="6">☆</button>
          <button data-rating="7">☆</button>
          <button data-rating="8">☆</button>
          <button data-rating="9">☆</button>
          <button data-rating="10">☆</button>
        </div>

        <div class="rating-numbers">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
          <span>7</span>
          <span>8</span>
          <span>9</span>
          <span>10</span>
        </div>
      </div>
    </div>
  `;

  const readingListBtn = document.querySelector(".reading-list-btn");
  const ratingButtons = document.querySelectorAll(".rating-stars button");

  if (readingListBtn) {
    readingListBtn.addEventListener("click", () => {
      addToReadingList(book);
    });
  }

  ratingButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const score = Number(button.dataset.rating);
      submitRating(book, score);
    });
  });

  updateAverageRating(book.documentId);
}

// ===============================
// AUTH
// ===============================

async function register(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post(`${API_URL}/auth/local/register`, {
      username,
      email,
      password,
    });

    localStorage.setItem("token", response.data.jwt);
    localStorage.setItem("username", response.data.user.username);

    window.location.href = "index.html";
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error);
    alert("Registrering misslyckades.");
  }
}

async function login(event) {
  event.preventDefault();

  const identifier = document.getElementById("loginIdentifier").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await axios.post(`${API_URL}/auth/local`, {
      identifier,
      password,
    });

    localStorage.setItem("token", response.data.jwt);
    localStorage.setItem("username", response.data.user.username);

    window.location.href = "index.html";
  } catch (error) {
    console.error("Login failed:", error.response?.data || error);
    alert("Inloggning misslyckades.");
  }
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "index.html";
}
// ===============================
// THEMES
// ===============================

async function fetchTheme() {
  try {
    const response = await axios.get(`${API_URL}/themes`);

    const themes = response.data.data;

    if (!themes || themes.length === 0) return;

    const activeTheme = themes[0].themeName;

    document.body.classList.remove(
      "theme-minimalist",
      "theme-dark",
      "theme-natural",
    );

    document.body.classList.add(`theme-${activeTheme}`);
  } catch (error) {
    console.error("Could not fetch theme:", error.response?.data || error);
  }
}
function updateAuthUI() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");

  if (token && username) {
    if (welcomeText) {
      welcomeText.textContent = `Välkommen tillbaka, ${username} — din nästa bok väntar 📖`;
    }

    if (profileLink) {
      profileLink.style.display = "inline-flex";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "inline-flex";
    }

    if (authButtons) {
      authButtons.style.display = "none";
    }
  } else {
    if (welcomeText) {
      welcomeText.textContent = "";
    }

    if (profileLink) {
      profileLink.style.display = "none";
    }

    if (logoutBtn) {
      logoutBtn.style.display = "none";
    }

    if (authButtons) {
      authButtons.style.display = "flex";
    }
  }
}

async function getCurrentUser() {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_URL}/users/me?populate=*`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

// ===============================
// READING LIST
// ===============================

function getReadingList() {
  return JSON.parse(localStorage.getItem("readingList")) || [];
}

function saveReadingList(list) {
  localStorage.setItem("readingList", JSON.stringify(list));
}

function addToReadingList(book) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Du behöver logga in för att spara böcker.");
    window.location.href = "login.html";
    return;
  }

  const readingList = getReadingList();

  const alreadyExists = readingList.find(
    (item) => item.documentId === book.documentId,
  );

  if (alreadyExists) {
    alert("Boken finns redan i din läslista.");
    return;
  }

  readingList.push(book);
  saveReadingList(readingList);

  const readingListBtn = document.querySelector(".reading-list-btn");

  if (readingListBtn) {
    readingListBtn.classList.add("saved");
    readingListBtn.textContent = "Sparad";
  }
}

function renderReadingList(sortBy = "title") {
  if (!readingListContainer) return;

  let readingList = getReadingList();

  readingList.sort((a, b) => {
    const valueA = (a[sortBy] || "").toLowerCase();
    const valueB = (b[sortBy] || "").toLowerCase();

    return valueA.localeCompare(valueB, "sv");
  });

  readingListContainer.innerHTML = "";

  if (readingList.length === 0) {
    readingListContainer.innerHTML = `
      <div class="empty-state">
        <h2>Din läslista är tom</h2>
        <p>Gå till alla böcker och spara böcker du vill läsa senare.</p>
        <a href="index.html" class="btn">Utforska böcker</a>
      </div>
    `;
    return;
  }

  readingList.forEach((book) => {
    const imageUrl = getMediaUrl(book.coverImage);

    const item = document.createElement("article");
    item.classList.add("reading-list-item");

    item.innerHTML = `
      ${
        imageUrl
          ? `<img src="${imageUrl}" alt="${book.title}" />`
          : `<div class="book-placeholder small"></div>`
      }

      <div>
        <h3>${book.title}</h3>
        <p>${book.author}</p>
      </div>

      <button class="remove-reading-btn" data-book-id="${book.documentId}">
        Ta bort
      </button>
    `;

    readingListContainer.appendChild(item);
  });
}

function removeFromReadingList(bookId) {
  const readingList = getReadingList();

  const updatedList = readingList.filter((book) => book.documentId !== bookId);

  saveReadingList(updatedList);
  renderReadingList(sortReadingList?.value || "title");
}

// ===============================
// RATINGS

async function fetchRatingsForBook(bookId) {
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(
      `${API_URL}/ratings?filters[book][documentId][$eq]=${bookId}&populate[book][populate]=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    console.error("Could not fetch ratings:", error.response?.data || error);
    return [];
  }
}

function calculateAverageRating(ratings) {
  if (!ratings || ratings.length === 0) {
    return "-";
  }

  const total = ratings.reduce((sum, rating) => {
    return sum + Number(rating.score);
  }, 0);

  return (total / ratings.length).toFixed(1);
}

async function updateAverageRating(bookId) {
  const ratings = await fetchRatingsForBook(bookId);
  const average = calculateAverageRating(ratings);

  const averageRatingElement = document.getElementById("averageRating");

  if (averageRatingElement) {
    averageRatingElement.textContent = average;
  }
}
async function submitRating(book, score) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Du behöver logga in för att betygsätta böcker.");
    window.location.href = "login.html";
    return;
  }

  try {
    const user = await getCurrentUser();

    console.log("BOOK:", book);
    console.log("USER:", user);

    await axios.post(
      `${API_URL}/ratings`,
      {
        data: {
          score: Number(score),

          book: {
            connect: [book.documentId],
          },

          user: {
            connect: [user.id],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    await updateAverageRating(book.documentId);

    alert(`Du gav boken ${score}/10 ⭐`);
  } catch (error) {
    console.log(
      "Rating error full:",
      JSON.stringify(error.response?.data, null, 2),
    );

    alert("Kunde inte spara betyget.");
  }
}
async function renderUserRatedBooksOnProfile(sortBy = "title") {
  if (!ratedBooksContainer) return;

  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/ratings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("MY RATINGS:", response.data.data);

    let ratings = response.data.data;
    // SORTERING
    ratings.sort((a, b) => {
      const bookA = a.book;
      const bookB = b.book;

      if (sortBy === "score") {
        return b.score - a.score;
      }

      const valueA = (bookA?.[sortBy] || "").toLowerCase();
      const valueB = (bookB?.[sortBy] || "").toLowerCase();

      return valueA.localeCompare(valueB, "sv");
    });

    ratedBooksContainer.innerHTML = "";

    // TOM LISTA
    if (ratings.length === 0) {
      ratedBooksContainer.innerHTML = `
        <div class="empty-state">
          <h2>Du har inte betygsatt några böcker ännu</h2>
          <p>Gå till en bok och ge ett betyg mellan 1 och 10.</p>
        </div>
      `;
      return;
    }

    // LOOPA RATINGS
    ratings.forEach((rating) => {
      const book = rating.book;

      if (!book) return;

      const imageUrl = getMediaUrl(book.coverImage);

      const item = document.createElement("article");

      item.classList.add("rated-book-item");

      item.innerHTML = `
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${book.title}" />`
            : `<div class="book-placeholder small"></div>`
        }

        <div class="rated-book-info">
          <h3>${book.title}</h3>
          <p>${book.author}</p>
        </div>

        <div class="rated-score">
          ★ ${rating.score}/10
        </div>
      `;

      ratedBooksContainer.appendChild(item);
    });
  } catch (error) {
    console.error(
      "Could not fetch user ratings:",
      error.response?.data || error,
    );

    ratedBooksContainer.innerHTML = `
      <p>Kunde inte hämta dina betyg.</p>
    `;
  }
}
// ===============================
// INIT
// ===============================

if (registerForm) {
  registerForm.addEventListener("submit", register);
}

if (loginForm) {
  loginForm.addEventListener("submit", login);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

if (searchInput) {
  searchInput.addEventListener("input", searchBooks);
}

if (booksList) {
  fetchBooks();
}

if (bookDetailsContainer) {
  fetchBookDetails();
}

if (readingListContainer || ratedBooksContainer) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
  }

  const username = localStorage.getItem("username");

  if (profileUsername && username) {
    profileUsername.textContent = username;
  }

  renderReadingList();
  renderUserRatedBooksOnProfile();

  if (sortReadingList) {
    sortReadingList.addEventListener("change", () => {
      renderReadingList(sortReadingList.value);
    });
  }

  if (sortRatedBooks) {
    sortRatedBooks.addEventListener("change", () => {
      renderUserRatedBooksOnProfile(sortRatedBooks.value);
    });
  }

  if (readingListContainer) {
    readingListContainer.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-reading-btn")) {
        const bookId = event.target.dataset.bookId;
        removeFromReadingList(bookId);
      }
    });
  }
}

updateAuthUI();
fetchTheme();
