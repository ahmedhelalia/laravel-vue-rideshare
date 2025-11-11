import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'

export const useTripStore = defineStore('trip', () => {
  const id = ref(null)
  const user_id = ref(null)

  const origin = ref([])

  const destination = reactive({
    lat: null,
    lng: null
  })

  const driver_location = reactive({
    lat: null,
    lng: null
  })

  const destination_name = ref('')

  const driver = reactive({
    id: null,
    year: null,
    model: null,
    license_plate: null,
    user: {
      name: null
    }
  })

  const is_started = ref(false)
  const is_complete = ref(false)

  const reset = () => {
    id.value = null
    user_id.value = null
    origin.value = null
    destination.lat = null
    destination.lng = null
    destination_name.value = null
    driver_location.lat = null
    driver_location.lng = null

    driver.id = null
    driver.year = null
    driver.make = null
    driver.model = null
    driver.license_plate = null
    driver.user.name = null

    is_started.value = false
    is_complete.value = false
  }

  return { id, user_id, origin, destination, destination_name, reset, is_complete, is_started, driver }
})
