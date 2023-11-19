/*eslint-disable*/
import L from 'leaflet';

console.log('hello from the client side');

const locations = document.getElementById('map').dataset.locations;

console.log(locations);

// Refer leaflet docs
export const displayMap = (locations) => {
  const map = L.map('map', {
    zoom: 12,
    zoomControl: false,
    scrollWheelZoom: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let bounds;
  const boundsArray = [];

  locations.forEach((loc) => {
    const [lat, lng] = loc.coordinates;
    const el = document.createElement('div');
    el.className = 'marker';
    boundsArray.push(L.latLng(lng, lat));
    L.marker([lng, lat])
      .bindPopup(loc.description)
      .addTo(map)
      .on('add', function () {
        this.openPopup();
      });
  });

  bounds = L.latLngBounds(boundsArray);
  map.fitBounds(bounds, {
    padding: [100, 100],
  });
};
