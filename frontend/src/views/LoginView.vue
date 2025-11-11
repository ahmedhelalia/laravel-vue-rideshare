<template>
  <div class="pt-16">
    <div v-if="!waitingOnVerification">
      <h1 class="text-3xl font-semibold mb-4"> Enter your phone number </h1>

      <form action="#" @submit.prevent="handleLogin">
        <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left">
          <div class="bg-white px-4 py-5 sm:p-6">
            <div>
              <input type="text" v-maska data-maska="+############" v-model="credentials.phone" name="phone" id="phone"
                placeholder="+2 0101249029"
                class="mt-4 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm">
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <button type="submit" @submit.prevent="handleLogin"
              class="text-white inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-2">
              Continue
            </button>
          </div>
        </div>
      </form>
    </div>
    <div v-else>
      <p class="text-message-notification text-green-600">{{
        text_message }}</p>
      <h1 class="text-3xl font-semibold mb-4"> Enter your verification code </h1>
      <form action="#" @submit.prevent="handleVerification">
        <div class="overflow-hidden shadow sm:rounded-md max-w-sm mx-auto text-left">
          <div class="bg-white px-4 py-5 sm:p-6">
            <div>
              <input type="text" v-maska data-maska="######" v-model="credentials.login_code" name="login_code"
                id="login_code" placeholder="123456"
                class="mt-4 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm">
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 text-right sm:px-6">
            <button type="submit" @submit.prevent="handleVerification"
              class="text-white inline-flex justify-center rounded-md border border-transparent bg-black py-2 px-2">
              Verify
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { vMaska } from "maska/vue";
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const text_message = ref('')

const credentials = reactive({
  phone: null,
  login_code: null
});

const waitingOnVerification = ref(false);

onMounted(() => {
  if (localStorage.getItem('token')) {
    router.push({
      name: 'landing'
    });
  }
});

const handleLogin = () => {
  axios.post('http://localhost:8000/api/login', { phone: credentials.phone })
    .then((response) => {
      //console.log(response.data.message);
      text_message.value = response.data.message
      setTimeout(() => {
        text_message.value = ''
      }, 1500)
      waitingOnVerification.value = true;
    })
    .catch((error) => {
      console.error(error);
      alert(error.response.data.message);
    })
}

const handleVerification = () => {
  axios.post('http://localhost:8000/api/login/verify', {
    phone: credentials.phone,
    login_code: credentials.login_code
  })
    .then((response) => {
      //console.log(response.data); // auth token
      localStorage.setItem('token', response.data);
      router.push({
        name: 'landing'
      });
    })
    .catch((error) => {
      console.error(error);
      alert(error.response.data.message);
    })
}
</script>
