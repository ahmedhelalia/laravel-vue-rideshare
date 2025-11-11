<!--
  This template defines the user interface for the MapView component.
  It displays the trip details, including a map with the route and a confirmation button.
-->
<template>
  <div class="pt-16">
    <!-- Page Title -->
    <h1 class="text-3xl font-semibold mb-4">Here's your trip</h1>

    <!-- Leaflet Map Container for the route -->
    <div class="mt-8 max-w-sm mx-auto" style="height: 300px;">
      <div id="map-container" style="height: 100%; width: 100%;"></div>
    </div>

    <!-- Trip Details and Confirmation -->
    <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left mt-8">
      <div class="bg-white px-4 py-5 sm:p-6">
        <!-- Displaying the destination name -->
        <p class="text-xl">Going to <strong>{{ destinationName }}</strong></p>
      </div>
      <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
        <!-- "Let's Go!" Button to confirm the trip -->
        <button @click="handleConfirmTrip"
          class="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-3 text-white">
          Let's Go!
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import necessary libraries and components
import { onMounted, computed } from "vue";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useLocationStore } from "@/stores/location";
import { useTripStore } from "@/stores/trip";
import { useRouter } from "vue-router";
import http from "@/helpers/http";

// Initialize location store and router
const locationStore = useLocationStore();
const router = useRouter();
const trip = useTripStore();
/**
 * Handles the trip confirmation.
 * Sends trip data to the backend API and navigates to the 'trip' view on success.
 */
const handleConfirmTrip = () => {
  http().post('/api/trip', {
    origin: locationStore.currentLocation,
    destination: locationStore.selectedLocation.geometry,
    destination_name: locationStore.selectedLocation.name
  })
    .then((response) => {
      trip.$patch(response.data)
      router.push({
        name: 'trip'
      })
    })
    .catch((error) => {
      console.error(error)
    })
}

// Computed property to get the destination name from the location store.
const destinationName = computed(() => {
  return locationStore.selectedLocation ? locationStore.selectedLocation.name : 'your destination';
});

/**
 * onMounted lifecycle hook.
 * Initializes the Leaflet map and displays the route from the user's current location to the selected destination.
 */
onMounted(() => {
  // Ensure that location data is available before initializing the map
  if (!locationStore.currentLocation || !locationStore.selectedLocation.geometry.lat) {
    console.error("Location data is not available.");
    return;
  }

  // Extract coordinates from the location store
  const currentLat = locationStore.currentLocation[0];
  const currentLng = locationStore.currentLocation[1];
  const selectedLat = locationStore.selectedLocation.geometry.lat;
  const selectedLng = locationStore.selectedLocation.geometry.lng;

  // Initialize the Leaflet map
  const map = L.map("map-container", {
    maxBounds: [[22, 25], [32, 36]], // Bounding box for Egypt
    minZoom: 6,
  }).setView([currentLat, currentLng], 13);

  // Add OpenStreetMap tile layer to the map
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Custom red icon for the user's current location marker
  const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Add Leaflet Routing Machine control to the map
  L.Routing.control({
    waypoints: [
      L.latLng(currentLat, currentLng),
      L.latLng(selectedLat, selectedLng),
    ],
    routeWhileDragging: false,
    geocoder: L.Control.Geocoder.nominatim(),
    lineOptions: {
      styles: [{ color: 'blue', opacity: 0.6, weight: 4 }]
    },
    createMarker: function (i, waypoint) {
      const markerOptions = {
        draggable: false,
      };
      if (i === 0) {
        // Use the custom red icon for the starting waypoint (current location)
        markerOptions.icon = redIcon;
      }
      return L.marker(waypoint.latLng, markerOptions);
    },
    show: false, // Hide the default routing instructions panel
    addWaypoints: false, // Prevent adding new waypoints by clicking on the map
    fitSelectedRoutes: true, // Zoom the map to fit the entire route
  }).addTo(map);
});
</script>
