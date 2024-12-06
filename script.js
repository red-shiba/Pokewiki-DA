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

        return `
          <div class="pokemon-card" style="background-color: ${bgColor}">
            <img src="${pokemon.sprites.front_default}" alt="${name} image">
            <h2>${name}</h2>
            <p>Type: ${types}</p>
          </div>
        `;
      })
      .join("");

      if (pokemonPerPage < 1025 && cardContainer.innerHTML) {
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
    button.removeEventListener("click", loadMorePokemon);
    button.classList.add("loading");
    text.style.opacity = 0;

    container.appendChild(button);

    await delay(2000);
    pokemonPerPage += 20;
    renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
  }

  function searchPokemon() {
    const query = searchInput.value.trim().toLowerCase();
    let removeCardClickEvent = false;

    if (query.length < 3) {
      renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
      return;
    } else if (query.length <=3) {
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
    const popupContainer = document.createElement("div");
    popupContainer.classList.add("popup-container");
  
    const { id, name, height, weight, sprites, stats, types } = pokemon;
    const typeNames = types.map((type) => capitalizeFirstLetter(type.type.name)).join(", ");
  
      const statsList = stats
      .map(
        (stat) => `
          <div class="stat-item">
            <span>${capitalizeFirstLetter(stat.stat.name)}:</span>
            <div class="stat-bar">
              <div style="width: ${stat.base_stat}%;"></div>
            </div>
            <span>${stat.base_stat}</span>
          </div>
        `
      )
      .join("");
  
      popupContainer.innerHTML = `
      <div class="popup-content">
        <div class="popup-header">
          <h2>#${String(id).padStart(3, "0")} ${capitalizeFirstLetter(name)}</h2>
          <button class="popup-close">&times;</button>
        </div>
        <div class="popup-body">
          <div class="popup-about">
            <img src="${sprites.front_default}" alt="${name}">
            <div class="pokemon-info">
              <p><strong>Type:</strong> ${typeNames}</p>
              <p><strong>Height:</strong> ${(height / 10).toFixed(1)} m</p>
              <p><strong>Weight:</strong> ${(weight / 10).toFixed(1)} kg</p>
            </div>
          </div>
        </div>
        <div class="tabs">
          <div class="tab active" data-tab="about">About</div>
          <div class="tab" data-tab="stats">Base Stats</div>
          <div class="tab" data-tab="moves">Moves</div>
        </div>
      </div>
    `;
  
    document.body.appendChild(popupContainer);
    
    popupContainer.querySelector(".popup-close").addEventListener("click", () => {
      document.body.removeChild(popupContainer);
    });
  
    const tabs = popupContainer.querySelectorAll(".tab");
    const tabContents = popupContainer.querySelectorAll(".popup-body > div");
    
    tabs.forEach((tab) =>
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((content) => content.classList.remove("active"));

        tab.classList.add("active");
        const targetContent = popupContainer.querySelector(`.popup-${tab.dataset.tab}`);
        targetContent.classList.add("active");
      })
    );

    popupContainer.style.display = "flex";
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
