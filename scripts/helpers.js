export function getBackgroundColor(types) {
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

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}