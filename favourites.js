var _API_URL = `https://gateway.marvel.com:443/v1/public/characters?ts=${_ts}&apikey=${_APIKEY_PUBLIC}&hash=${_hash}`;
var _timeout = null;

var state = {
	characters: [],
	favs: []
}

// Init
async function initialize() {
	state.characters = [];
	state.favs = [];

	// Get favs
	state.favs = getFavourites();

	// Query marvel api
	let i = 0, arr = state.favs.length;
	for (i; i < arr; i++) {
		let url = `https://gateway.marvel.com:443/v1/public/characters/${state.favs[i]}?ts=${_ts}&apikey=${_APIKEY_PUBLIC}&hash=${_hash}`;
		await fetch(url)
			.then(handleResponse)
			.then(res => {
				console.log(res);

				let results = res.data.results.map(c => ({
					id: c.id, name: c.name, thumbnail: c.thumbnail
				}))[0];
				state.characters.push(results);

				console.log("state", state)
			});
	}

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
		var character = document.getElementById(`character-${id}`);
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
				character.remove();
			}
		}

	})

};

window.onload = () => {
	initialize();
}