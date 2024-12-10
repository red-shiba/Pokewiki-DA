import { pokemonPerPage, mainContainer, searchInput, allPokemon, loadMorePokemon } from "./main.js";
import { getBackgroundColor, capitalizeFirstLetter } from "./helpers.js";
import { createPopup } from "./popup.js";

export let morePokemonPerPage = 0;

export function renderPokemonCards(pokemonList, removeCardClickEvent) {
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card-container");
  cardContainer.id = "cardContainer";

  cardContainer.innerHTML = pokemonList
    .map((pokemon) => {
      const bgColor = getBackgroundColor(pokemon.types);
      const types = pokemon.types.map((t) => t.type.name).join(", ");
      const name = capitalizeFirstLetter(pokemon.name);

      return cardsContentTemplate(bgColor, pokemon, name, types);
    })
    .join("");

  if (pokemonPerPage < 1025 && cardContainer.innerHTML && !removeCardClickEvent) { // render loading Button for more Pokemon
    const button = document.createElement("button");
    button.id = "loadButton";
    button.type = "button";
    button.classList.add("button");
    button.innerHTML = `
    <span>Load More</span>
    <div class="loadingImage"></div>
    `;

    button.addEventListener("click", loadMorePokemon);
    cardContainer.appendChild(button);
  }

  if (!cardContainer.innerHTML) {
    const loadAnimation = document.createElement("div");
    loadAnimation.id = "loadAnimation";

    cardContainer.appendChild(loadAnimation);
  }

  mainContainer.innerHTML = "";
  mainContainer.appendChild(cardContainer);

  if (removeCardClickEvent) { // Need to remove event, because searchPokemon() adds his own Event
    document.querySelectorAll(".pokemon-card").forEach((card, index) => {
      card.removeEventListener("click", () => createPopup(allPokemon[index]));
    });
  } else {
    addCardClickEvent();
  }
}


export function searchPokemon() {
  const query = searchInput.value.trim().toLowerCase();
  let removeCardClickEvent = false;

  if (query.length < 3) {
    renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
    return;
  } else if (query.length >=3) {
    removeCardClickEvent = true;
  }

  let filteredPokemon = allPokemon.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(query)
  );

  renderPokemonCards(filteredPokemon, removeCardClickEvent);
  addCardClickEvent(filteredPokemon);

  if (document.getElementById("loadAnimation")) {
    const emptySearch = document.createElement("div");
    emptySearch.id = "emptySearch";
    emptySearch.innerHTML = `<span>Leider keine Pokemon Gefunden</span>`;
    const loadAnimation = document.getElementById("loadAnimation")
    loadAnimation.style.display = "none";

    cardContainer.appendChild(emptySearch);
  }
}

export function addCardClickEvent(filteredPokemon) {
  if (filteredPokemon) {
    document.querySelectorAll(".pokemon-card").forEach((card, index) => {
      card.addEventListener("click", () => createPopup(filteredPokemon[index]));
    });
  } else {
    document.querySelectorAll(".pokemon-card").forEach((card, index) => {
      card.addEventListener("click", () => createPopup(allPokemon[index]));
    });
  }
}