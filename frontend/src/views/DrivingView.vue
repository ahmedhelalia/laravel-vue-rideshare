<template>
  <div class="pt-16">
    <h1 class="text-3xl font-semibold mb-4"> {{ title }} </h1>
  </div>
  <div>
    <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left" v-if="!trip.is_complete">
      <div class="bg-white px-4 py-5 sm:p-6">
        <div>
          <div class="mt-8 max-w-sm mx-auto" style="height: 300px;">
            <div id="map-container" style="height: 100%; width: 100%;"></div>
          </div>
        </div>
        <div class="mt-2">
          <p class="text-xl"> Going to <strong>pick up a passenger</strong></p>
        </div>
        <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
          <button v-if="trip.is_started" @click="handleCompleteTrip"
            class="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-4 text-white">
            Complete Trip
          </button>

          <button v-else @click="handlePassengerPickedUp" class="inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-4
            text-white">
            Passenger Picked Up
          </button>
        </div>
      </div>
    </div>
    <div v-else class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left">
      <div class="bg-white px-4 py-5 sm:p-6">
        <Done />
      </div>
    </div>
  </div>
</template>

<script setup>
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-control-geocoder"; // Needed for geocoder in routing machine
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useLocationStore } from '@/stores/location';
import { useTripStore } from '@/stores/trip';
import { onMounted, ref } from "vue";
import http from "@/helpers/http";
import router from "@/router";
import Done from "@/components/Done.vue";

const location = useLocationStore();
const trip = useTripStore();
const map = ref(null);
const driverMarker = ref(null);
const passengerMarker = ref(null);
const title = ref('Driving to passenger....')

const handlePassengerPickedUp = () => {
  http().post(`/api/trip/${trip.id}/start`)
    .then((response) => {
      title.value = 'Traveling to the destination...'
      location.$patch({
        destination: {
          name: response.data.destination_name,
          geometry: response.data.destination
        }
      })
      trip.$patch(response.data)
    })
    .catch((error) => {
      console.error(error)
    })
}

const handleCompleteTrip = () => {
  http().post(`/api/trip/${trip.id}/end`)
    .then((response) => {
      title.value = 'Trip Completed'
      trip.$patch(response.data)

      setTimeout(() => {
        trip.reset()
        location.reset()

        router.push({
          name: 'standby'
        })
      }, 3000)
    })
    .catch((error) => {
      console.error(error)
    })
}

onMounted(() => {
  let mapInitialized = false;

  navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const driverLatLng = L.latLng(latitude, longitude);

      // Update the store with the new location
      location.setCurrentLocation({
        geometry: { lat: latitude, lng: longitude }
      });

      // Initialize the map, markers, and routing only on the first successful location update
      if (!mapInitialized) {
        map.value = L.map("map-container").setView(driverLatLng, 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map.value);

        // Custom Icons
        const carIcon = L.icon({
          iconUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="32px" height="32px"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>')}`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const personIcon = L.icon({
          iconUrl: `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="32px" height="32px"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>')}`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        driverMarker.value = L.marker(driverLatLng, { icon: carIcon }).addTo(map.value);

        // Only add passenger marker and routing if trip.origin is available
        if (trip.origin && trip.origin.length) {
          const passengerLatLng = L.latLng(trip.origin[0], trip.origin[1]);
          passengerMarker.value = L.marker(passengerLatLng, { icon: personIcon }).addTo(map.value);

          L.Routing.control({
            waypoints: [driverLatLng, passengerLatLng],
            routeWhileDragging: false,
            geocoder: L.Control.Geocoder.nominatim(),
            lineOptions: {
              styles: [{ color: 'blue', opacity: 0.6, weight: 4 }]
            },
            createMarker: () => null, // We are creating our own markers
            show: false,
            addWaypoints: false,
            fitSelectedRoutes: true,
          }).addTo(map.value);
        }
        mapInitialized = true;
      } else {
        // If map is already initialized, just update driver marker position and pan
        driverMarker.value.setLatLng(driverLatLng);
        map.value.panTo(driverLatLng);
      }
    },
    (err) => {
      console.error(`Geolocation error: ${err.message}`);
      // As a fallback, show a map of Cairo if geolocation fails
      if (!map.value) {
        map.value = L.map("map-container").setView([30.0444, 31.2357], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map.value);
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
});
</script>
