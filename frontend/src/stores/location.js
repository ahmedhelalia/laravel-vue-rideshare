import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export const useLocationStore = defineStore('location', () => {
  const selectedLocation = reactive({
    name: '',
    address: '',
    geometry: {
      lat: null,
      lng: null
    }
  })

  const currentLocation = ref(null);

  function setSelectedLocation(location) {
    selectedLocation.name = location.display_name;
    selectedLocation.address = location.display_name; // Or a more specific address part if available
    selectedLocation.geometry.lat = location.lat;
    selectedLocation.geometry.lng = location.lon;
  }

  function setCurrentLocation(location) {
    currentLocation.value = location;
  }

  const reset = () => {
    selectedLocation.name = null
    selectedLocation.address = null
    selectedLocation.geometry.lat = null
    selectedLocation.geometry.lng = null

    currentLocation.value = null
  }

  return { selectedLocation, currentLocation, setSelectedLocation, setCurrentLocation, reset }
})
