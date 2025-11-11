<template>
  <div class="pt-16">
    <h1 class="text-3xl font-semibold mb-4">{{ title }}</h1>
    <div v-if="!trip.id" class="mt-8 flex justify-center">
      <Loader />
    </div>
    <div v-else>
      <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left">
        <div class="bg-white px-4 py-5 sm:p-6">
          <!-- Leaflet Map Container for the route -->
          <div class="mt-8 max-w-sm mx-auto" style="height: 300px;">
            <div id="map-container" style="height: 100%; width: 100%;"></div>
          </div>

          <div class="mt-2">
            <p class="text-xl">Going to <strong>{{ trip.destination_name }}</strong></p>
          </div>

          <div class="flex justify-between bg-gray-50 px-4 py-3 text-right sm:px-6">
            <button @click="handleDeclineTrip"
              class="inline-flex justify-center rounded-md border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-400 focus:outline-none">
              Decline
            </button>
            <button @click="handleAcceptTrip"
              class="inline-flex justify-center rounded-md border-transparent bg-black py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-400 focus:outline-none">
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Loader from '@/components/Loader.vue';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { onMounted, ref } from 'vue';
import { useTripStore } from '@/stores/trip';
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useLocationStore } from '@/stores/location';
import router from '@/router';
import http from '@/helpers/http';

//Pusher.logToConsole = true;
const title = ref('Waiting for ride request...');
const trip = useTripStore();
const location = useLocationStore();

const handleDeclineTrip = () => {
  trip.reset()
  title.value = 'Waiting for ride request...'
}

const handleAcceptTrip = () => {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const driverLocation = {
      lat: latitude,
      lng: longitude
    };

    http().post(`/api/trip/${trip.id}/accept`, {
      driver_location: driverLocation
    })
      .then((response) => {
        location.$patch({
          destination: {
            name: 'Passenger',
            geometry: response.data.origin
          }
        })

        router.push({
          name: 'driving'
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }, (error) => {
    console.error(error);
    alert("Could not get your location. Please ensure location services are enabled.");
  });
}

onMounted(async () => {
  await location.currentLocation
  let echo = new Echo({
    broadcaster: 'reverb',
    key: 'hvp514zzywosr3ipunjv',
    wsHost: '127.0.0.1',
    wsPort: 8080,
    forceTLS: false,
    enabledTransports: ['ws'],
  })

  echo.channel('drivers')
    .listen('.TripCreated', (e) => {
      title.value = 'Ride requested:'
      trip.$patch(e.trip)
      //console.warn('********** EVENT RECEIVED! **********', e);
      setTimeout(initMapDirections, 2000)
    })
})

const initMapDirections = () => {
  // Extract coordinates from the location store
  const originLat = trip.origin[0];
  const originLng = trip.origin[1];
  const destinationLat = trip.destination.lat;
  const destinationLng = trip.destination.lng;

  // Initialize the Leaflet map
  const map = L.map("map-container", {
    maxBounds: [[22, 25], [32, 36]], // Bounding box for Egypt
    minZoom: 6,
  }).setView([originLat, originLng], 13);

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
      L.latLng(originLat, originLng),
      L.latLng(destinationLat, destinationLng),
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
}
</script>
