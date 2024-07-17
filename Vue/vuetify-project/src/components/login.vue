<template>
  <div class="login-container">
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card
        class="elevation-12"
        style="width: inherit; max-width: 550px; border-radius: 20px"
      >
        <v-card-title class="text-center">
          <div>
            <v-img class="mb-4" height="80" src="@/assets/doc_logo.png" />
            <h1 class="text-h4 font-weight-bold">GP Finder</h1>
            <div class="text-body-2 font-weight-bold mb-n1">Welcome Back</div>
          </div>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="login">
            <v-text-field
              v-model="email"
              label="Email address"
              type="email"
              variant="underlined"
              :error-messages="formErrors.email"
              @blur="
                v$.email.$touch;
                removeError('email');
              "
              required
            ></v-text-field>
            <v-text-field
              v-model="password"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              variant="underlined"
              :error-messages="formErrors.password"
              @blur="
                v$.password.$touch;
                removeError('pass');
              "
              @click:append="togglePasswordVisibility"
              required
            ></v-text-field>
            <v-btn
              type="submit"
              color="primary"
              class="mt-4"
              block
              :disabled="isFormInvalid"
              >Login</v-btn
            >
          </v-form>
          <div class="text-center mt-4">
            <span>Not registered? </span>
            <a href="#" @click.prevent="$router.push({ name: 'Register' })"
              >Register here</a
            >
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import { required, email } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import axios from "axios";

const api_url = "http://localhost:5038/";

export default {
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      loginError: "",
    };
  },
  validations() {
    return {
      email: { required, email },
      password: { required },
    };
  },
  setup() {
    return { v$: useVuelidate() };
  },
  computed: {
    formErrors() {
      return {
        email: this.getFieldErrors(this.v$.email).concat(
          this.loginError === "User not found" ? "Email does not exist" : []
        ),
        password: this.getFieldErrors(this.v$.password).concat(
          this.loginError === "Invalid password" ? "Wrong password" : []
        ),
      };
    },
    isFormInvalid() {
      return this.v$.$invalid || this.loginError !== "";
    },
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async login() {
      this.v$.$touch();
      if (this.v$.$invalid) return;

      this.loginError = "";

      try {
        const response = await axios.post(api_url + "login", {
          email: this.email,
          password: this.password,
        });
        const { token, userId, userType } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId); // Store the user ID
        localStorage.setItem("userType", userType); // Store the user type
        alert("Login successful!");
        if (userType === "GP") {
          this.$router.push({ name: "WelcomeGP" });
        } else if (userType === "Public") {
          this.$router.push({ name: "WelcomePublic" });
        }
      } catch (error) {
        console.error("Error logging in:", error);
        if (error.response && error.response.data.error) {
          this.loginError = error.response.data.error;
        } else if (error.request) {
          this.loginError = "No response from server. Please try again later.";
        } else {
          this.loginError = error.message;
        }
      }
    },
    getFieldErrors(field) {
      const errors = field.$errors;
      return errors.map((e) => {
        if (e.$validator === "required") return "This field is required";
        if (e.$validator === "email") return "Must be a valid email address";
        return "Invalid input";
      });
    },
    removeError(type) {
      if (type === "email") {
        this.formErrors.email = "";
        this.loginError = "";
      } else if (type === "pass") {
        this.formErrors.password = "";
        this.loginError = "";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  background-image: url("@/assets/background.jpg");
  background-size: cover !important;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0;
  width: 100vw;
  height: 100vh;
}

.mt-4 {
  margin-top: 4rem;
}

a {
  color: #1976d2;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
