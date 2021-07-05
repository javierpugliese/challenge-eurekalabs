var _API_URL = `https://gateway.marvel.com:443/v1/public/characters?ts=${_ts}&apikey=${_APIKEY_PUBLIC}&hash=${_hash}`;
var _timeout = null;

var state = {
  totalItems: 0,
  characters: [],
  searchResults: [],
  favs: [],
  limit: 36,
  offset: 0,
  totalPages: 0,
  currentPage: 1,
}

// Prepare pagination
function paginate() {
  var element = document.querySelector(".pagination");
  element.innerHTML = "";  // Clear

  state.totalPages = Math.ceil(state.totalItems / state.limit);

  // Before and after current selected page
  var current = state.currentPage,
    last = state.totalPages,
    maxShownPages = 4,
    left = current - maxShownPages,
    right = current + maxShownPages + 1;

  // Insert html
  let i = 1, pages = state.totalPages;
  for (i; i <= pages; i++) {
    if (i == 1 || i == last || i >= left && i < right) {
      let id = `page-${i}`;
      element.insertAdjacentHTML('beforeEnd', `
        <button class="page-btn" id="${id}" value="${i}">${i}</button>
      `);

      let btn = document.getElementById(id);
      btn.onclick = () => {
        state.currentPage = +btn.value;
        goToPage(+btn.value);
      }
    }
  }

  // Previous and next page btns
  var prevBtn = document.getElementById("prev");
  var nextBtn = document.getElementById("next");
  if (state.currentPage == 1) prevBtn.classList.add("hide");
  else prevBtn.classList.remove("hide");
  if (state.currentPage == state.totalPages)
    nextBtn.classList.add("hide");
  else nextBtn.classList.remove("hide");

  prevBtn.onclick = () => {
    previousPage();
  }

  nextBtn.onclick = () => {
    nextPage();
  }

  // Selected page color
  var btns = document.querySelectorAll(".page-btn");
  btns.forEach(button => button.classList.remove("red"));
  var btn = document.querySelector(`button[value="${state.currentPage}"]`);
  btn.classList.add("red");

  // Show results count
  var searchCount = document.querySelector("div.search-count");
  searchCount.textContent = state.totalItems > 0 ?
    `${state.totalItems} Result(s).` : `No results available.`;
}

function goToPage(page) {
  state.offset = (page - 1) * state.limit;
  initialize();
}

function previousPage() {
  state.offset -= 36;
  state.currentPage = state.currentPage - 1;
  initialize();
}

function nextPage() {
  state.offset = state.offset + 36;
  state.currentPage = state.currentPage + 1;
  initialize();
}

function prepareSearch() {
  // Search input
  var searchInp = document.querySelector(`input[type="text"].search`);
  var searchDiv = document.querySelector(`div.search-content`);
  var searchContainer = document.querySelector(".search-content");

  searchInp.onkeyup = () => {
    searchInp.value ? searchDiv.classList.remove("hide") : searchDiv.classList.add("hide");

    // Clear delay
    clearTimeout(_timeout);

    // Search
    if (searchInp.value.length > 3) {
      searchContainer.innerHTML = `
        <a href="javascript:void(0)">Searching...</a>
      `;
      _timeout = setTimeout(async () => {
        // Query marvel api
        var url = `${_API_URL}&nameStartsWith=${searchInp.value}`;
        await fetch(url)
          .then(handleResponse)
          .then(res => {
            state.searchResults = res.data.results.map(c => ({
              id: c.id, name: c.name
            }));
          })
          .finally(() => {
            searchContainer.innerHTML = "";
          });

        // Display results in dropdown
        if (state.searchResults.length > 0) {
          state.searchResults.forEach(c => {
            searchContainer.insertAdjacentHTML("beforeEnd", `
              <a href="javascript:void(0)" id="resultItem-${c.id}">${c.name}</a>
            `);
            let selector = `#resultItem-${c.id}`;
            let resultItem = document.querySelector(selector);
            resultItem.onclick = (e) => {
              e.preventDefault();
              viewCharacter(c.id);
            }
          })
        }
        else {
          searchContainer.innerHTML = `
          <a href="javascript:void(0)">No matches found!</a>
        `;
        }
      }, 1250);
    }
    else {
      searchContainer.innerHTML = `
        <a href="javascript:void(0)">Keep typing...</a>
      `;
    }
  }

  // Hide dropdown if dropdown or input lose focus
  document.onclick = (e) => {
    let searchDivClicked = searchDiv.contains(e.target);
    let searchInputClicked = searchInp.contains(e.target);
    if (!searchDivClicked && !searchInputClicked) {
      searchDiv.classList.add("hide");
    }
  }

  // Show dropdown
  searchInp.onfocus = () => {
    searchDiv.classList.remove("hide");
  }
}

// Init
async function initialize() {
  state.characters = [];
  state.searchResults = [];

  // Get favs
  state.favs = getFavourites();

  // Query marvel api
  var url = `${_API_URL}&limit=${state.limit}&offset=${state.offset}`
  await fetch(url)
    .then(handleResponse)
    .then(res => {
      console.log(res);
      state.characters = res.data.results.map(c => ({
        id: c.id, name: c.name, thumbnail: c.thumbnail, desc: c.description
      }));
      state.totalItems = res.data.total;
      console.log("state", state)
    });

  paginate();
  prepareSearch();

  // Character cards
  var cardContainer = document.querySelector(".card-container");
  cardContainer.innerHTML = "";  // Clear

  state.characters.forEach(c => {
    let id = `page-${c.id}`;
    let path = c.thumbnail.path + "/standard_xlarge." + c.thumbnail.extension;
    cardContainer.insertAdjacentHTML('beforeEnd', `
      <div class="card" id="character-${id}">
        <button class="fav-btn" id="favbtn-${c.id}" value="${c.id}">
          <i class="${state.favs.indexOf(c.id) !== -1 ? 'fas' : 'far'} fa-star"></i>
        </button>
        <img class="card-image" src="${path}" alt="${c.name}" title="${c.name}" />
        <div class="card-overlay">${c.name}</div>
      </div>
    `);
    let character = document.getElementById(`character-${id}`);
    character.onclick = () => {
      viewCharacter(c.id);
    }

    // Add or remove from favourites
    let favId = `favbtn-${c.id}`;
    let favBtn = document.getElementById(favId);
    favBtn.onclick = (e) => {
      e.stopPropagation();  // Avoid child to fire parent events
      // Toggle star class
      let favIcon = document.querySelector(`#${favId} > i`);
      if (favIcon.classList.contains("far")) {
        favIcon.classList.remove("far");
        favIcon.classList.add("fas");
        addFavourite(c.id, state.favs);
      }
      else if (favIcon.classList.contains("fas")) {
        favIcon.classList.remove("fas");
        favIcon.classList.add("far");
        removeFavourite(c.id, state.favs);
      }
    }

  })

};

window.onload = () => {
  initialize();
}