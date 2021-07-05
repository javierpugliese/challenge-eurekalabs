const _APIKEY_PUBLIC = "b8dd831127ace5057bc2c52ba9e9a4a4";
const _APIKEY_PRIVATE = "4a5894cbd0c04dd48226c160dfcbec02dea1ed45";
var _ts = Number(new Date());
var _hash = md5(_ts.toString() + _APIKEY_PRIVATE + _APIKEY_PUBLIC);

function handleResponse(response) {
  return response.json()
    .then(json => {
      if (response.ok) {
        return json
      } else {
        return Promise.reject(json)
      }
    })
}

function getFavourites() {
  return [...new Set(JSON.parse(localStorage.getItem("favourites")))];
}

function addFavourite(id, arr) {
  arr.push(id);
  // Avoid duplicates
  localStorage.setItem("favourites", JSON.stringify([...new Set(arr)]))
}

function removeFavourite(id, arr) {
  let array = [...new Set(arr)];
  let index = array.indexOf(id);
  arr.splice(index, 1);
  localStorage.setItem("favourites", JSON.stringify(arr))
}

function viewCharacter(id) {
  localStorage.setItem("characterId", id);
  window.location = "character.html";
}