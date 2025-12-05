
document.addEventListener("DOMContentLoaded", () => {
    const locations = document.getElementById("map")?.getAttribute("data-locations")
    const locationJSON = JSON.parse(locations)
    console.log(locationJSON[0].coordinates)
    // Create a Leaflet map centered on first location
    const map = L.map('map', { zoomControl: false }).setView(
        [...locationJSON[0].coordinates.reverse()],
        8
    );

    // Add OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for each location
    locationJSON.forEach(loc => {
        L.marker([loc.coordinates[1], loc.coordinates[0]])
            .addTo(map)
            .bindPopup(loc.description);
    });




})




