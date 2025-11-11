<template>
  <div class="pt-16">
    <h1 class="text-3xl font-semibold mb-4"> {{ title }}</h1>
    <div>
      <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left">
        <div class="bg-white px-4 py-5 sm:p-6">
          <div class="mt-8 max-w-sm mx-auto" style="height: 300px;">
            <div id="map-container" style="height: 100%; width: 100%;"></div>
          </div>
        </div>

        <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <span> {{ message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useTripStore } from '@/stores/trip';
import { useLocationStore } from '@/stores/location';
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import router from '@/router';

const location = useLocationStore()
const trip = useTripStore()
const title = ref('Waiting on a driver....')
const message = ref('Whenever a driver accepts a trip, their info will appear here.')

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

  echo.channel(`passenger_${trip.user_id}`)
    .listen('TripAccepted', (e) => {
      trip.$patch(e.trip)
      title.value = 'A driver is on the way!'
      // console.warn('********** EVENT RECEIVED! **********', e)
      message.value = `${e.trip.driver.user.name} is coming in a ${e.trip.driver.year} ${e.trip.driver.model} with a license plate #${trip.driver.license_plate}`
    })

    .listen('TripLocationUpdated', (e) => {
      //console.warn('********** EVENT LOCATION UPDATED RECEIVED! **********', e)
      trip.$patch(e.trip)
    })

    .listen('TripStarted', (e) => {
      trip.$patch(e.trip)
      // console.warn('********** EVENT TRIP STARTED! **********', e)
      title.value = "You're on your way!"
      message.value = `You are headed to ${e.trip.destination_name}`
    })

    .listen('TripEnded', (e) => {
      trip.$patch(e.trip)
      //console.warn('********** Trip ENDED RECEIVED! **********', e)
      title.value = "You've arrived!"
      message.value = `Hope you enjoyed your ride with ${e.trip.driver.user.name}`

      setTimeout(() => {
        trip.reset()
        location.reset()
        router.push({
          name: 'landing'
        })
      }, 5000)
    })

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
})
</script>
