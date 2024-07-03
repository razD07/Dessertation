<script>
import { required, email, minLength, sameAs } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import axios from "axios";
import { computed } from "vue";

const api_url = "http://localhost:5038/";

export default {
  name: "Register",
  data() {
    return {
      tab: "tab-1", // Initialize the tab variable with a default value
      showPassword: false, // State to toggle password visibility
      gpForm: {
        name: "",
        email: "",
        clinicName: "",
        phoneNumber: "",
        address: "",
        password: "",
        confirmPassword: "", // Added confirmPassword field
      },
      publicForm: {
        name: "",
        email: "",
        phoneNumber: "",
        address: "",
        dob: "",
        password: "",
        confirmPassword: "", // Added confirmPassword field
      },
      gpEmailError: "",
      publicEmailError: "",
    };
  },
  validations() {
    return {
      gpForm: {
        name: { required },
        email: { required, email },
        clinicName: { required },
        phoneNumber: { required },
        address: { required },
        password: { required, minLength: minLength(6) },
        confirmPassword: {
          required,
          sameAsPassword: sameAs(computed(() => this.gpForm.password)),
        },
      },
      publicForm: {
        name: { required },
        email: { required, email },
        phoneNumber: { required },
        address: { required },
        dob: { required },
        password: { required, minLength: minLength(6) },
        confirmPassword: {
          required,
          sameAsPassword: sameAs(computed(() => this.publicForm.password)),
        },
      },
    };
  },
  setup() {
    return { v$: useVuelidate() };
  },
  computed: {
    gpFormErrors() {
      return {
        name: this.getFieldErrors(this.v$.gpForm.name),
        email: [
          ...this.getFieldErrors(this.v$.gpForm.email),
          this.gpEmailError,
        ].filter(Boolean),
        clinicName: this.getFieldErrors(this.v$.gpForm.clinicName),
        phoneNumber: this.getFieldErrors(this.v$.gpForm.phoneNumber),
        address: this.getFieldErrors(this.v$.gpForm.address),
        password: this.getFieldErrors(this.v$.gpForm.password),
        confirmPassword: this.getFieldErrors(this.v$.gpForm.confirmPassword),
      };
    },
    publicFormErrors() {
      return {
        name: this.getFieldErrors(this.v$.publicForm.name),
        email: [
          ...this.getFieldErrors(this.v$.publicForm.email),
          this.publicEmailError,
        ].filter(Boolean),
        phoneNumber: this.getFieldErrors(this.v$.publicForm.phoneNumber),
        address: this.getFieldErrors(this.v$.publicForm.address),
        dob: this.getFieldErrors(this.v$.publicForm.dob),
        password: this.getFieldErrors(this.v$.publicForm.password),
        confirmPassword: this.getFieldErrors(
          this.v$.publicForm.confirmPassword
        ),
      };
    },
    isGpFormInvalid() {
      return this.v$.gpForm.$invalid || this.gpEmailError !== "";
    },
    isPublicFormInvalid() {
      return this.v$.publicForm.$invalid || this.publicEmailError !== "";
    },
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async checkUserExists(email) {
      if (email) {
        try {
          const response = await axios.get(api_url + "checkUserExists", {
            params: { email },
          });
          if (!response.data.exists) {
            this.gpEmailError = "";
            this.publicEmailError = "";
          }
          return response.data.exists;
        } catch (error) {
          console.error("Error checking user existence:", error);
          return false;
        }
      }
    },
    async submitGPForm() {
      this.v$.gpForm.$touch();
      if (this.v$.gpForm.$invalid) return;

      this.gpEmailError = ""; // Clear previous email error

      // Check if email already exists
      if (await this.checkUserExists(this.gpForm.email)) {
        this.gpEmailError = "Email already exists";
        return;
      }

      try {
        const response = await axios.post(api_url + "register/gp", this.gpForm);
        console.log("GP Form Data:", response.data);

        // Store the token in localStorage
        localStorage.setItem("token", response.data.token);

        this.$router.push({ name: "WelcomeGP" });
        alert("GP registered successfully!");
      } catch (error) {
        console.error("Error registering GP:", error);
        if (error.response && error.response.data.error) {
          this.gpEmailError = error.response.data.error;
        } else if (error.request) {
          this.gpEmailError =
            "No response from server. Please try again later.";
        } else {
          this.gpEmailError = error.message;
        }
      }
    },
    async submitPublicForm() {
      this.v$.publicForm.$touch();
      if (this.v$.publicForm.$invalid) return;

      this.publicEmailError = ""; // Clear previous email error

      // Check if email already exists
      if (await this.checkUserExists(this.publicForm.email)) {
        this.publicEmailError = "Email already exists";
        return;
      }

      try {
        const response = await axios.post(
          api_url + "register/public",
          this.publicForm
        );
        console.log("Public Form Data:", response.data);

        // Store the token in localStorage
        localStorage.setItem("token", response.data.token);

        this.$router.push({ name: "WelcomePublic" });
        alert("Public user registered successfully!");
      } catch (error) {
        console.error("Error registering public user:", error);
        if (error.response && error.response.data.error) {
          this.publicEmailError = error.response.data.error;
        } else if (error.request) {
          this.publicEmailError =
            "No response from server. Please try again later.";
        } else {
          this.publicEmailError = error.message;
        }
      }
    },
    getFieldErrors(field) {
      const errors = field.$errors;
      return errors.map((e) => {
        if (e.$validator === "required") return "This field is required";
        if (e.$validator === "email") return "Must be a valid email address";
        if (e.$validator === "minLength")
          return "Password must be at least 6 characters long";
        if (e.$validator === "sameAsPassword") return "Passwords do not match";
        return "Invalid input";
      });
    },
  },
};
</script>

<template>
  <div class="login-container">
    <v-container class="fill-height" style="justify-content: center">
      <v-card
        class="elevation-12"
        style="
          width: inherit;
          max-width: 550px;
          height: 650px;
          border-radius: 20px;
        "
        ><v-tabs
          v-model="tab"
          align-tabs="center"
          color="primary"
          class="custom-tabs align-center"
          dense
          grow
        >
          <v-tab value="tab-1" class="custom-tab">
            <v-icon class="mr-2">mdi-account</v-icon>
            GP
          </v-tab>

          <v-tab value="tab-2" class="custom-tab">
            <v-icon class="mr-2">mdi-account-multiple</v-icon>
            Public
          </v-tab>
        </v-tabs>
        <v-card-text>
          <div class="form-container">
            <div v-if="tab === 'tab-1'" class="form-content">
              <v-form @submit.prevent="submitGPForm">
                <v-text-field
                  variant="underlined"
                  v-model="gpForm.name"
                  label="Name"
                  :error-messages="gpFormErrors.name"
                  @blur="v$.gpForm.name.$touch"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="gpForm.email"
                  label="Email"
                  type="email"
                  :error-messages="gpFormErrors.email"
                  @blur="
                    v$.gpForm.email.$touch;
                    checkUserExists(gpForm.email);
                  "
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="gpForm.phoneNumber"
                  label="Phone Number"
                  :error-messages="gpFormErrors.phoneNumber"
                  @blur="v$.gpForm.phoneNumber.$touch"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="gpForm.address"
                  label="Address"
                  :error-messages="gpFormErrors.address"
                  @blur="v$.gpForm.address.$touch"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="gpForm.clinicName"
                  label="Clinic Name"
                  :error-messages="gpFormErrors.clinicName"
                  @blur="v$.gpForm.clinicName.$touch"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="gpForm.password"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  label="Password"
                  :error-messages="gpFormErrors.password"
                  @blur="v$.gpForm.password.$touch"
                  @click:append="togglePasswordVisibility"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="gpForm.confirmPassword"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  label="Confirm Password"
                  :error-messages="gpFormErrors.confirmPassword"
                  @blur="v$.gpForm.confirmPassword.$touch"
                  @click:append="togglePasswordVisibility"
                  required
                ></v-text-field>
                <v-btn
                  type="submit"
                  color="primary"
                  :disabled="isGpFormInvalid"
                  class="register-button"
                  >Register</v-btn
                >
              </v-form>
            </div>

            <div v-if="tab === 'tab-2'" class="form-content">
              <v-form @submit.prevent="submitPublicForm">
                <v-text-field
                  variant="underlined"
                  v-model="publicForm.name"
                  label="Name"
                  :error-messages="publicFormErrors.name"
                  @blur="v$.publicForm.name.$touch"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="publicForm.email"
                  label="Email"
                  type="email"
                  :error-messages="publicFormErrors.email"
                  @blur="v$.publicForm.email.$touch"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="publicForm.phoneNumber"
                  label="Phone Number"
                  :error-messages="publicFormErrors.phoneNumber"
                  @blur="v$.publicForm.phoneNumber.$touch"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="publicForm.address"
                  label="Address"
                  :error-messages="publicFormErrors.address"
                  @blur="v$.publicForm.address.$touch"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  type="date"
                  v-model="publicForm.dob"
                  label="Date of Birth"
                  :error-messages="publicFormErrors.dob"
                  @blur="v$.publicForm.dob.$touch"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="publicForm.password"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  label="Password"
                  :error-messages="publicFormErrors.password"
                  @blur="v$.publicForm.password.$touch"
                  @click:append="togglePasswordVisibility"
                  required
                ></v-text-field>
                <v-text-field
                  variant="underlined"
                  v-model="publicForm.confirmPassword"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :type="showPassword ? 'text' : 'password'"
                  label="Confirm Password"
                  :error-messages="publicFormErrors.confirmPassword"
                  @blur="v$.publicForm.confirmPassword.$touch"
                  @click:append="togglePasswordVisibility"
                  required
                ></v-text-field>
                <v-btn
                  type="submit"
                  color="primary"
                  :disabled="isPublicFormInvalid"
                  class="register-button"
                  >Register</v-btn
                >
              </v-form>
            </div>
          </div>
          <div class="py-4"></div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.mt-4 {
  margin-top: 4rem;
}

.custom-tabs {
  background-color: #f5f5f5; /* Light grey background color */
  border-radius: 8px; /* Rounded corners */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Slight shadow for depth */
}

.custom-tab {
  font-size: 14px; /* Smaller font size */
  padding: 8px 12px; /* Reduced padding for a snug fit */
  transition: background-color 0.3s ease; /* Smooth transition for hover effect */
  display: flex; /* Use flexbox for better alignment */
  align-items: center; /* Center align items */
}

.custom-tab:hover {
  background-color: #e0e0e0; /* Slightly darker grey on hover */
}

.form-container {
  position: relative;
  margin-top: 20px;
  min-height: 400px; /* Ensure the container has a minimum height */
}

.form-content {
  position: absolute;
  width: 100%;
  top: 0;
}
.login-container {
  background-image: url("@/assets/background.jpg");
  background-size: cover !important;
  background-position: center;
  background-repeat: no-repeat;
  padding: 0;
  width: 100vw;
  height: 100vh;
}
.register-button {
  width: 102%;
  margin: 10px 0;
}
</style>
