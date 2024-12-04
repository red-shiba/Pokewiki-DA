document.addEventListener("DOMContentLoaded", () => {
  const mainContainer = document.querySelector("main");
  const searchInput = document.querySelector("input[type='search']");
  let allPokemon = [];
  let pokemonPerPage = 20;

  function calculatePokemonCount() {
    const cardHeight = 150;
    const cardWidth = 200;
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    const rows = Math.ceil(screenHeight / cardHeight) + 1;
    const cols = Math.floor(screenWidth / cardWidth);
    return Math.max(rows * cols, 20);
  }

  async function fetchAllPokemon() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
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

  function renderPokemonCards(pokemonList) {
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container");

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

    mainContainer.innerHTML = "";
    mainContainer.appendChild(cardContainer);
  }

  function searchPokemon() {
    const query = searchInput.value.trim().toLowerCase();
    if (query.length < 3) {
      renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
      return;
    }

    const filteredPokemon = allPokemon.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query)
    );

    renderPokemonCards(filteredPokemon);
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

  window.addEventListener("resize", () => {
    pokemonPerPage = calculatePokemonCount();
    renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
  });

  fetchAllPokemon();
});
