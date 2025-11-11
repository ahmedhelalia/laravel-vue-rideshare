<!--
  This template defines the user interface for the LocationView component.
  It includes a form for destination input, a map for visual selection, and buttons for user actions.
-->
<template>
  <div class="pt-16">
    <!-- Page Title -->
    <h1 class="text-3xl font-semibold mb-4">Where are we going?</h1>
    
    <!-- Destination Input Form -->
    <form action="#">
      <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left">
        <div class="bg-white px-4 py-5 sm:p-6">
          <div>
            <!-- Destination search input -->
            <input type="text" id="destination" placeholder="My destination"
              class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm" @input="handleInput" />
            
            <!-- Search suggestions dropdown -->
            <div v-if="searchSuggestions.length > 0" class="border border-gray-300 rounded-md mt-1">
              <ul>
                <li v-for="suggestion in searchSuggestions" :key="suggestion.place_id">
                  <a href="#" @click.prevent="selectSuggestion(suggestion)" class="block px-4 py-2 hover:bg-gray-100">
                    {{ suggestion.display_name }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <!-- "Get Current Location" Button -->
          <div class="mt-4">
            <button type="button" @click="getCurrentLocation"
              class="inline-flex justify-center rounded-md border border-transparent bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300">
              Get Current Location
            </button>
          </div>
        </div>
        
        <!-- "Find A Ride" Button -->
        <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <button type="button" @click="findRide"
            class="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-4 text-white">
            Find A Ride
          </button>
        </div>
      </div>
    </form>
  </div>
  
  <!-- Leaflet Map Container -->
  <div class="mt-8" style="height: 500px;">
    <l-map ref="map" v-model:zoom="zoom" :center="[30.5833, 31.0000]" :max-bounds="[[22, 25], [32, 36]]" :min-zoom="6"
      @click="handleMapClick">
      <!-- OpenStreetMap Tile Layer -->
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
        name="OpenStreetMap"></l-tile-layer>
      
      <!-- Marker for selected destination -->
      <l-marker v-if="selectedLocation" :lat-lng="[selectedLocation.lat, selectedLocation.lon]">
        <l-popup>{{ selectedLocation.display_name }}</l-popup>
      </l-marker>
      
      <!-- Marker for user's current location -->
      <l-marker v-if="currentLocation" :lat-lng="currentLocation" :icon="redIcon">
        <l-popup>Your Location</l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script setup>
// Import necessary libraries and components
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import { ref } from "vue";
import L from "leaflet";
import { useLocationStore } from "@/stores/location";
import { useRouter } from "vue-router";

// Initialize location store and router
const locationStore = useLocationStore();
const router = useRouter();

// Reactive variables for map and location state
const zoom = ref(9);
const map = ref(null);
let selectedLocation = ref(null);
const searchSuggestions = ref([]);
let debounceTimeout = null;
const currentLocation = ref(null);

// Custom red icon for the user's current location marker
const redIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

/**
 * Handles user input in the destination search field.
 * Fetches search suggestions from Nominatim API with debouncing.
 * @param {Event} e - The input event.
 */
const handleInput = (e) => {
  clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(async () => {
    const query = e.target.value;
    if (query.length < 3) {
      searchSuggestions.value = [];
      return;
    }
    const params = new URLSearchParams({
      q: query,
      format: "json",
      countrycodes: "eg", // Restrict search to Egypt
      viewbox: "30.0000,30.5000,31.5000,31.0000", // Bounding box for Menofia Governorate (approx)
      bounded: 1, // Strictly limit to viewbox
      addressdetails: 1,
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: {
        'Accept-Language': 'ar,en',
      },
    });
    const data = await response.json();
    searchSuggestions.value = data;
  }, 500);
};

/**
 * Handles the selection of a search suggestion.
 * Updates the selected location, input field, and map view.
 * @param {object} suggestion - The selected suggestion object from Nominatim.
 */
const selectSuggestion = (suggestion) => {
  selectedLocation.value = suggestion;
  document.getElementById("destination").value = suggestion.display_name;
  searchSuggestions.value = [];
  map.value.leafletObject.setView([suggestion.lat, suggestion.lon], 15);
  locationStore.setSelectedLocation(suggestion);
};

/**
 * Handles a click event on the map.
 * Performs a reverse geocoding lookup to find the address of the clicked point.
 * @param {object} e - The Leaflet map click event.
 */
const handleMapClick = async (e) => {
  const { lat, lng } = e.latlng;
  const params = new URLSearchParams({
    lat,
    lon: lng,
    format: "json",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`);
  const data = await response.json();
  selectSuggestion(data);
};

/**
 * Navigates to the 'map' view if both current location and destination are set.
 * Otherwise, it alerts the user to complete the required selections.
 */
const findRide = () => {
  if (locationStore.currentLocation && locationStore.selectedLocation.geometry.lat) {
    router.push({
      name: 'map'
    })
  } else {
    alert("Please select a destination and get your current location.");
  }
};

/**
 * Retrieves the user's current geolocation using the browser's Geolocation API.
 * Updates the current location state in the component and the location store.
 */
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentLocation.value = [position.coords.latitude, position.coords.longitude];
        locationStore.setCurrentLocation(currentLocation.value);
      },
      (error) => {
        console.error(error);
        alert("Could not get your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
};
</script>
