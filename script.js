document.addEventListener("DOMContentLoaded", () => {
  const mainContainer = document.querySelector("main");
  const searchInput = document.querySelector("input[type='search']");
  let allPokemon = [];
  let pokemonPerPage = 20;
  const delay = ms => new Promise(res => setTimeout(res, ms));

  function calculatePokemonCount() {
    const cardHeight = 150;
    const cardWidth = 200;
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    const rows = Math.ceil(screenHeight / cardHeight) + 1;
    const cols = Math.floor(screenWidth / cardWidth);
    return Math.max(rows * cols, 20);
  }

  function init() {
    fetchAllPokemon();
    resizeWindow();
  }

  async function fetchAllPokemon() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025");
      const data = await response.json();
      const pokemonList = data.results;

      allPokemon = await Promise.all(
        pokemonList.map((pokemon) => fetch(pokemon.url).then((res) => res.json()))
      );

      pokemonPerPage = calculatePokemonCount();
      renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
    } catch (error) {
      console.error("Failed to fetch Pokemon data:", error);
    }
  }

  function resizeWindow() {
    pokemonPerPage = calculatePokemonCount();
      renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
  }

  function renderPokemonCards(pokemonList, removeCardClickEvent) {
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

  async function loadMorePokemon() {
    const button = document.getElementById("loadButton");
    const container = document.getElementById("cardContainer");
    const text = button.querySelector("span");
    const animation = button.querySelector("div")
    button.removeEventListener("click", loadMorePokemon);
    button.classList.add("loading");
    text.style.display = "none";
    animation.style.display = "block";

    container.appendChild(button);

    await delay(Math.random() * (1000 - 500) + 500);
    pokemonPerPage += 20;
    renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
  }

  function searchPokemon() {
    const query = searchInput.value.trim().toLowerCase();
    let removeCardClickEvent = false;

    if (query.length < 3) {
      renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
      return;
    } else if (query.length >=3) {
      removeCardClickEvent = true;
    }

    const filteredPokemon = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query)
    );

    renderPokemonCards(filteredPokemon, removeCardClickEvent);
    addCardClickEvent(filteredPokemon);
  }

  function getBackgroundColor(types) {
    const typeColors = {
      fire: "#FDDFDF",
      grass: "#DEFDE0",
      electric: "#FCF7DE",
      water: "#DEF3FD",
      ground: "#F4E7DA",
      rock: "#D5D5D4",
      fairy: "#FCEAFF",
      poison: "#D6B3FF",
      bug: "#F8D5A3",
      dragon: "#97B3E6",
      psychic: "#EAEDA1",
      flying: "#F5F5F5",
      fighting: "#E6E0D4",
      normal: "#F5F5F5",
    };

    const primaryType = types[0]?.type.name;
    return typeColors[primaryType] || "#F5F5F5";
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  searchInput.addEventListener("input", searchPokemon);

  function createPopup(pokemon) {
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
  
  function closePopup(popupOverlay) {
    document.body.style.overflow = "";
    popupOverlay.remove();
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

  init();
});
