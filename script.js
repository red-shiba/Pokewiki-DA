document.addEventListener("DOMContentLoaded", () => {
  const mainContainer = document.querySelector("main");

  async function fetchPokemon() {
    try {
      const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20");
      const data = await response.json();
      const pokemonList = data.results;

      // Fetch details for each Pokemon
      const pokemonDetails = await Promise.all(
        pokemonList.map((pokemon) => fetch(pokemon.url).then((res) => res.json()))
      );

      renderPokemonCards(pokemonDetails);
    } catch (error) {
      console.error("Failed to fetch Pokemon data:", error);
    }
  }

  function renderPokemonCards(pokemonList) {
    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container");

    pokemonList.forEach((pokemon) => {
      const card = document.createElement("div");
      card.classList.add("pokemon-card");
      card.style.backgroundColor = getBackgroundColor(pokemon.types);

      const img = document.createElement("img");
      img.src = pokemon.sprites.front_default;
      img.alt = `${pokemon.name} image`;

      const name = document.createElement("h2");
      name.textContent = capitalizeFirstLetter(pokemon.name);

      const type = document.createElement("p");
      type.textContent = `Type: ${pokemon.types.map((t) => t.type.name).join(", ")}`;

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(type);

      cardContainer.appendChild(card);
    });

    mainContainer.appendChild(cardContainer);
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
    return typeColors[primaryType] || "#F5F5F5"; // Default to neutral color
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  fetchPokemon();
});
