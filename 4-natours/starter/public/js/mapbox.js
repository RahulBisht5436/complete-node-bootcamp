document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById("map");
    if (!el) return console.error("Map element not found");

    const locations = el.getAttribute("data-locations");
    if (!locations) return console.error("No location data found");
    
    let locationJSON;
    try {
        locationJSON = JSON.parse(locations);
    } catch (err) {
        return console.error("Invalid JSON in data-locations", err);
    }

    const [lng, lat] = locationJSON[0].coordinates;

    const map = L.map('map', { zoomControl: false }).setView(
        [lat, lng],
        8
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    locationJSON.forEach(loc => {
        const [lng, lat] = loc.coordinates;
        L.marker([lat, lng]).addTo(map).bindPopup(loc.description);
    });
});
