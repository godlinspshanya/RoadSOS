let map;
let userLocation;
let markers = [];

// Initialize map - called by Google Maps script
function initMap() {
  // Default location (Chennai) until GPS loads
  const defaultLocation = { lat: 13.0827, lng: 80.2707 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: defaultLocation,
  });

  // Get user's real location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        map.setCenter(userLocation);

        // Blue dot for user's location
        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 3,
          },
        });

        // Auto-load hospitals on start
        findPlaces("hospital");
      },
      () => {
        alert("Please allow location access for RoadSoS to work!");
      }
    );
  }
}

// Find nearby places based on type
function findPlaces(type) {
  if (!userLocation) {
    alert("Getting your location... please wait.");
    return;
  }

  // Clear old markers
  markers.forEach((m) => m.setMap(null));
  markers = [];

  const service = new google.maps.places.PlacesService(map);

  const request = {
    location: userLocation,
    radius: 5000, // 5 km radius
    type: type,
  };

  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      displayPlaces(results, type);
    } else {
      document.getElementById("places-container").innerHTML =
        "<p>No results found nearby. Try expanding search.</p>";
    }
  });
}

// Show places on map and in list
function displayPlaces(places, type) {
  const container = document.getElementById("places-container");
  container.innerHTML = "";

  const icons = {
    hospital: "🏥",
    police: "🚔",
    pharmacy: "💊",
    gas_station: "⛽",
  };

  places.slice(0, 8).forEach((place) => {
    // Add marker on map
    const marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
      label: icons[type] || "📍",
    });
    markers.push(marker);

    // Calculate distance
    const dist = getDistance(
      userLocation.lat, userLocation.lng,
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );

    // Create place card
    const card = document.createElement("div");
    card.className = "place-card";
    card.innerHTML = `
      <div>
        <strong>${icons[type]} ${place.name}</strong><br>
        <small>${place.vicinity}</small><br>
        <small>📏 ${dist} km away</small>
      </div>
      <a href="https://www.google.com/maps/dir/?api=1
         &origin=${userLocation.lat},${userLocation.lng}
         &destination=${place.geometry.location.lat()},
         ${place.geometry.location.lng()}"
         target="_blank">Navigate</a>
    `;
    container.appendChild(card);
  });
}

// Calculate distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

// SOS — sends location via WhatsApp
function sendSOS() {
  if (!userLocation) {
    alert("Getting location... try again in a second");
    return;
  }

  const mapsLink =
    `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}`;
  const msg =
    `🚨 SOS EMERGENCY! I had a road accident. My location: ${mapsLink} Please help immediately!`;
  const whatsappURL =
    `https://wa.me/?text=${encodeURIComponent(msg)}`;

  window.open(whatsappURL, "_blank");
}

// Toggle chatbot open/close
function toggleChat() {
  const body = document.getElementById("chatBody");
  body.style.display =
    body.style.display === "none" ? "flex" : "none";
}