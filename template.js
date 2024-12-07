function cardsContentTemplate(bgColor, pokemon, name, types) {
  return `
          <div class="pokemon-card" style="background-color: ${bgColor}">
            <img class="pokemon-card-img" src="${pokemon.sprites.front_default}" alt="${name} image">
            <h2>${name} <img class="type-icon-card" src="./assets/type_icons_png/${pokemon.types[0].type.name}.png" alt""></h2>
          </div>
        `;
};

function popupContentTemplate(bgColor, pokemon, capitalizeFirstLetter) {
  return `
      <div class="popup-card">
        <div class="popup-header" style="background-color: ${bgColor};">
          <h1># ${pokemon.id} ${capitalizeFirstLetter(pokemon.name)}</h1>
          ${pokemon.types
            .map(
              (type) =>
                `<span class="popup-type-badge">${capitalizeFirstLetter(
                  type.type.name
                )}
                <img class="type-icon" src="./assets/type_icons_png/${type.type.name}.png" alt="${type.type.name}">
                </span>
                `
            )
            .join("")}
        </div>
        <div class="popup-image" id="popupImageContainer" style="background-color: ${bgColor};">
          <div id="loadAnimation" class="custom-load-animation"></div>
          <img src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}" style="display: none;">
          <button class="popup-nav-btn left">◀</button>
          <button class="popup-nav-btn right">▶</button>
        </div>
        <div class="popup-tab-nav">
          <button class="popup-tab-btn active" data-tab="about">About</button>
          <button class="popup-tab-btn" data-tab="stats">Base Stats</button>
          <button class="popup-tab-btn" data-tab="abilities">Abilities</button>
        </div>
        <div class="popup-tab-content" id="popup-tab-content">
          <h3>About</h3>
          <p class="pokemon-description">Loading description...</p>
          <p>Height: ${(pokemon.height / 10).toFixed(1)} m</p>
          <p>Weight: ${(pokemon.weight / 10).toFixed(1)} kg</p>
        </div>
        <button class="popup-close-btn">X</button>
      </div>
    `;
}