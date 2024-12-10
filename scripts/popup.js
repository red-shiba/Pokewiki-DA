import { getBackgroundColor, capitalizeFirstLetter } from "./helpers.js";
import { allPokemon } from "./main.js";

export function createPopup(pokemon) {
  const bgColor = getBackgroundColor(pokemon.types);
  const popupOverlay = document.createElement("div");
  const popupContent = popupContentTemplate(bgColor, pokemon, capitalizeFirstLetter);
  popupOverlay.classList.add("popup-overlay");

  popupOverlay.innerHTML = popupContent;

  fetchPokemonDescription(pokemon.name, popupOverlay);

  const imageContainer = popupOverlay.querySelector("#popupImageContainer");
  const loadAnimation = popupOverlay.querySelector("#loadAnimation");
  const image = imageContainer.querySelector("img");

  loadAnimation.style.width = "50px";
  loadAnimation.style.height = "50px";

  image.onload = () => {
    loadAnimation.style.display = "none";
    image.style.display = "block";
  };

  image.onerror = () => {
    loadAnimation.style.display = "none";
    imageContainer.innerHTML += `<p>Image not available</p>`;
  };

  popupOverlay.querySelectorAll(".popup-tab-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      popupOverlay.querySelectorAll(".popup-tab-btn").forEach((btn) =>
        btn.classList.remove("active")
      );
      event.target.classList.add("active");
      updatePopupTabContent(pokemon, event.target.dataset.tab);
    });
  });

  popupOverlay.querySelector(".popup-close-btn").addEventListener("click", () => {
    closePopup(popupOverlay);
  });

  popupOverlay.addEventListener("click", (event) => {
    if (event.target === popupOverlay) {
      closePopup(popupOverlay);
    }
  });

  const leftButton = popupOverlay.querySelector(".popup-nav-btn.left");
  const rightButton = popupOverlay.querySelector(".popup-nav-btn.right");

  leftButton.addEventListener("click", () => {
    navigateToPokemon(pokemon, -1);
  });

  rightButton.addEventListener("click", () => {
    navigateToPokemon(pokemon, 1);
  });

  const handleKeyNavigation = (event) => {
    if (event.key === "ArrowLeft") {
      navigateToPokemon(pokemon, -1);
    } else if (event.key === "ArrowRight") {
      navigateToPokemon(pokemon, 1);
    } else if (event.key === "Escape") {
      closePopup(popupOverlay);
    }
  };

  document.addEventListener("keydown", handleKeyNavigation);

  popupOverlay.addEventListener("remove", () => {
    document.removeEventListener("keydown", handleKeyNavigation);
  });

  document.body.appendChild(popupOverlay);
  document.body.style.overflow = "hidden";
}

function fetchPokemonDescription(pokemonName, popupOverlay) {
  const apiUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      const englishEntry = data.flavor_text_entries.find(
        (entry) => entry.language.name === "en"
      );

      const description = englishEntry
        ? englishEntry.flavor_text.replace(/\s+/g, " ")
        : "No description available for this Pokémon.";

      const descriptionElement = popupOverlay.querySelector(".pokemon-description");
      descriptionElement.textContent = description;
    })
    .catch((error) => {
      console.error("Error fetching Pokémon description:", error);
      const descriptionElement = popupOverlay.querySelector(".pokemon-description");
      descriptionElement.textContent = "Failed to load description.";
    });
}

function navigateToPokemon(currentPokemon, direction) {
  const currentIndex = allPokemon.findIndex((p) => p.name === currentPokemon.name);
  let newIndex = currentIndex + direction;

  if (newIndex < 0) {
    newIndex = allPokemon.length - 1;
  } else if (newIndex >= allPokemon.length) {
    newIndex = 0;
  }

  const newPokemon = allPokemon[newIndex];

  document.querySelector(".popup-overlay").remove();

  createPopup(newPokemon);
}

function closePopup(popupOverlay) {
  document.body.style.overflow = "";
  popupOverlay.remove();
}

function updatePopupTabContent(pokemon, tab) {
  const tabContent = document.querySelector("#popup-tab-content");
  if (tab === "about") {
    tabContent.innerHTML = `
      <h3>About</h3>
      <p>Height: ${(pokemon.height / 10).toFixed(1)} m</p>
      <p>Weight: ${(pokemon.weight / 10).toFixed(1)} kg</p>
    `;
  } else if (tab === "stats") {
    tabContent.innerHTML = `
      <h3>Base Stats</h3>
      <ul>
        ${pokemon.stats.map(stat => `<li>${capitalizeFirstLetter(stat.stat.name)}: ${stat.base_stat}</li>`).join("")}
      </ul>
    `;
  } else if (tab === "abilities") {
    tabContent.innerHTML = `
      <h3>Abilities</h3>
      <ul>
        ${pokemon.abilities.map(ability => `<li>${capitalizeFirstLetter(ability.ability.name)}</li>`).join("")}
      </ul>
    `;
  }
}

function addCardClickEvent(filteredPokemon) {
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