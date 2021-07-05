var state = {
  characterId: null,
  isFavourite: false,
  characterData: {},
  favs: []
}

async function getCharacter() {
  state.characterId = JSON.parse(localStorage.getItem("characterId"));

  var url = `https://gateway.marvel.com:443/v1/public/characters/${state.characterId}?ts=${_ts}&apikey=${_APIKEY_PUBLIC}&hash=${_hash}`;

  await fetch(url)
    .then(handleResponse)
    .then(res => {
      console.log(res);
      state.characterData = res.data.results.map(c => ({
        id: c.id, name: c.name, thumbnail: c.thumbnail, description: c.description
      }))[0];
      console.log("state", state)
    });

  var character = state.characterData, thumbnail = character.thumbnail;
  var path = thumbnail.path + "/detail." + thumbnail.extension;

  var content = document.querySelector("section.content");
  content.innerHTML = `
    <div class="card">
      <div class="card-image">
        <img class="detail-image" src="${path}" alt="${character.name}" title="${character.name}">
      </div>      
      <div class="card-content">
        <div class="card-title">${character.name}</div>
        <div class="card-text">${character.description ? character.description : "Oops! Looks like this character doesn't have a description yet. You might tell a story before it's too late!."}</div>
        <div class="card-actions">
          <button class="action-btn back-btn"><i class="fas fa-arrow-alt-circle-left"></i> Characters List</button>
          <button class="action-btn fav-btn"><i class="far fa-star star"></i> <span class="fav-txt">Add to favourites</span></button>          
        </div>
      </div>
    </div>    
  `;
  var goBackBtn = document.querySelector("button.back-btn");
  goBackBtn.onclick = () => {
    window.location = "index.html";
  }

  favourites();
  console.log("state", state);
}

function favourites() {
  var favBtn = document.querySelector("button.fav-btn");
  var favTxt = document.querySelector(".fav-txt");
  var favIcon = document.querySelector("button.fav-btn > i");
  state.favs = getFavourites();
  var favs = state.favs;
  if (favs && favs.length) {
    if (favs.indexOf(state.characterId) > -1) {
      state.isFavourite = true;
      favTxt.textContent = "Added to favourites";
      if (favIcon.classList.contains("far")) {
        favIcon.classList.remove("far");
        favIcon.classList.add("fas");
      }
    } else favTxt.textContent = "Add to favourites";
  }

  favBtn.onclick = () => {
    if (favIcon.classList.contains("far")) {
      favIcon.classList.remove("far");
      favIcon.classList.add("fas");
      addFavourite(state.characterId, state.favs);
      state.isFavourite = true;
      favTxt.textContent = "Added to favourites";
    }
    else if (favIcon.classList.contains("fas")) {
      favIcon.classList.remove("fas");
      favIcon.classList.add("far");
      removeFavourite(state.characterId, state.favs);
      state.isFavourite = false;
      favTxt.textContent = "Add to favourites";
    }
  }
}

window.onload = () => {
  getCharacter();
}