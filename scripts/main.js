import { renderPokemonCards, searchPokemon, morePokemonPerPage } from "./renderCards.js";

export let pokemonPerPage = 20;
export const mainContainer = document.querySelector("main");
export const searchInput = document.querySelector("input[type='search']");
export let allPokemon = [];

export async function loadMorePokemon() {
  const delay = ms => new Promise(res => setTimeout(res, ms));
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

document.addEventListener("DOMContentLoaded", () => {
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

  function resizeWindow() {
    pokemonPerPage = calculatePokemonCount();
      renderPokemonCards(allPokemon.slice(0, pokemonPerPage));
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

  searchInput.addEventListener("input", searchPokemon);

  init();
});
