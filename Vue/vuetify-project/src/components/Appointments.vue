<template>
  <div>
    <v-container class="fill-height d-flex align-center justify-center">
      <v-card class="elevation-12 gp-card">
        <v-card-title class="text-left">
          <h1 v-if="isGP">Set Availability</h1>
          <h1 v-else>Book Appointment</h1>
        </v-card-title>
        <v-card-text>
          <v-alert v-if="isGP" type="info">
            Set your available time slots for each day.
          </v-alert>
          <v-alert v-else type="info">
            Book an appointment with your registered GP.
          </v-alert>

          <v-form ref="form">
            <v-row v-for="day in days" :key="day" class="mb-3" v-if="isGP">
              <v-col cols="12">
                <v-text-field
                  v-model="availability[day]"
                  :label="day"
                  placeholder="Enter available time slots separated by commas (e.g., 10:00-12:00,14:00-16:00)"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>

          <div v-if="!isGP" class="calendar-container is-light-mode">
            <Qalendar :events="events" :config="config">
              <template #eventDialog="props">
                <div
                  v-if="props.eventDialogData && props.eventDialogData.title"
                  class="custom-dialog"
                >
                  <div class="dialog-header">
                    <span class="dialog-title">Book Appointment</span>
                    <span class="dialog-close" @click="props.closeEventDialog"
                      >x</span
                    >
                  </div>
                  <div class="dialog-content">
                    <div class="dialog-time">
                      {{ formatDate(props.eventDialogData.time.start) }} -
                      {{ formatDate(props.eventDialogData.time.end) }}
                    </div>
                    <div class="dialog-gp">
                      <v-icon left>mdi-account</v-icon
                      >{{ props.eventDialogData.gpName }}
                    </div>
                  </div>
                  <div class="dialog-actions">
                    <v-btn color="primary" @click="confirmAppointment(props)"
                      >Book Appointment</v-btn
                    >
                  </div>
                </div>
              </template>
            </Qalendar>
          </div>
          <div
            v-if="
              !isGP && upcomingAppointment
                ? upcomingAppointment.length > 0
                : false
            "
          >
            <h2>Upcoming Appointment</h2>
            <v-card>
              <v-card-title>
                On {{ upcomingAppointment[0]?.date }} from
                {{ upcomingAppointment[0]?.time }}
              </v-card-title>
              <v-card-subtitle>{{
                upcomingAppointment.gpName
              }}</v-card-subtitle>
              <v-card-actions>
                <v-btn color="red" @click="cancelAppointment">Cancel</v-btn>
              </v-card-actions>
            </v-card>
          </div>
          <v-btn v-if="isGP" color="primary" @click="setAvailability">
            Save Availability
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Upcoming Appointment Section -->
  </div>
</template>

<script>
import axios from "axios";
import { getUserTypeFromToken } from "@/utils/auth";
import { Qalendar } from "qalendar";
import "qalendar/dist/style.css";

export default {
  name: "Appointments",
  components: { Qalendar },
  data() {
    return {
      days: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      },
      selectedSlot: null,
      availableSlots: [],
      selectedDate: null,
      selectedEvent: null,
      isGP: false,
      events: [],
      dialog: false,
      upcomingAppointment: null,
      config: {
        timeInterval: 30,
        firstDayOfWeek: 1,
        locales: {
          navigation: {
            month: "Month",
            week: "Week",
            day: "Day",
          },
        },
        eventDialog: {
          isCustom: true,
        },
      },
    };
  },
  created() {
    const token = localStorage.getItem("token");
    this.isGP = getUserTypeFromToken(token) === "GP";
    this.fetchAvailability();
    if (!this.isGP) {
      this.fetchUpcomingAppointment();
    }
  },
  methods: {
    async setAvailability() {
      try {
        const gpId = localStorage.getItem("userId");
        if (!gpId) {
          alert("GP ID not found. Please log in again.");
          return;
        }
        await axios.post(`http://localhost:5038/api/setAvailability`, {
          gpId,
          availability: this.availability,
        });
        alert("Availability saved successfully!");
        this.initializeEvents();
      } catch (error) {
        console.error("Error setting availability:", error);
        alert("Failed to save availability.");
      }
    },
    async fetchAvailability() {
      try {
        if (this.isGP) {
          const gpId = localStorage.getItem("userId");
          if (!gpId) {
            alert("GP ID not found. Please log in again.");
            return;
          }
          const response = await axios.get(
            `http://localhost:5038/api/getAvailability/${gpId}`
          );
          this.availability = response.data.availability || this.availability;
          this.gpName = response.data.name;
        } else {
          const publicUserId = localStorage.getItem("userId");
          if (!publicUserId) {
            alert("User ID not found. Please log in again.");
            return;
          }
          const response = await axios.get(
            `http://localhost:5038/api/registeredGP/${publicUserId}`
          );
          if (response.data) {
            const gpId = response.data._id;
            const availabilityResponse = await axios.get(
              `http://localhost:5038/api/getAvailability/${gpId}`
            );
            this.availability =
              availabilityResponse.data.availability || this.availability;
            this.gpName = response.data.name;
            this.initializeEvents();
          }
        }
      } catch (error) {
        console.error("Error fetching availability:", error);
        this.days.forEach((day) => {
          this.availability[day] = [];
        });
      }
    },
    async fetchUpcomingAppointment() {
      try {
        const publicUserId = localStorage.getItem("userId");
        if (!publicUserId) {
          alert("User ID not found. Please log in again.");
          return;
        }
        const response = await axios.get(
          `http://localhost:5038/api/upcomingAppointments/${publicUserId}`
        );
        this.upcomingAppointment = response.data || null; // Assuming only one appointment
      } catch (error) {
        console.error("Error fetching upcoming appointment:", error);
        alert("Failed to fetch upcoming appointment.");
      }
    },
    async bookAppointment(selectedEvent) {
      try {
        const publicUserId = localStorage.getItem("userId");
        if (!publicUserId) {
          alert("User ID not found. Please log in again.");
          return;
        }
        await axios.post(`http://localhost:5038/api/bookAppointment`, {
          publicUserId,
          date: selectedEvent.date,
          time: selectedEvent.time,
        });
        alert("Appointment booked successfully!");
        this.dialog = false;
        this.fetchUpcomingAppointment();
      } catch (error) {
        console.error("Error booking appointment:", error);
        alert("Failed to book appointment.");
      }
    },
    async cancelAppointment() {
      try {
        const publicUserId = localStorage.getItem("userId");
        if (!publicUserId) {
          alert("User ID not found. Please log in again.");
          return;
        }
        await axios.post(`http://localhost:5038/api/cancelAppointment`, {
          publicUserId,
        });
        alert("Appointment cancelled successfully!");
        this.upcomingAppointment = null;
      } catch (error) {
        console.error("Error cancelling appointment:", error);
        alert("Failed to cancel appointment.");
      }
    },
    initializeEvents() {
      this.events = [];
      for (let day in this.availability) {
        if (this.availability[day].length) {
          this.availability[day].forEach((slot) => {
            const [start, end] = slot.split("-");
            this.splitIntoIntervals(day, start, end).forEach((interval) => {
              const [intervalStart, intervalEnd] = interval;
              const event = {
                id: this.generateUniqueId(),
                title: "Book Appointment",
                with: this.gpName,
                time: {
                  start: intervalStart
                    .toISOString()
                    .slice(0, 16)
                    .replace("T", " "),
                  end: intervalEnd.toISOString().slice(0, 16).replace("T", " "),
                },
                color: "green",
                isEditable: false,
                gpName: this.gpName,
              };
              this.events.push(event);
            });
          });
        }
      }
    },
    splitIntoIntervals(day, start, end) {
      const intervals = [];
      let startTime = this.getDateForDay(day, start);
      const endTime = this.getDateForDay(day, end);

      while (startTime < endTime) {
        const intervalEnd = new Date(startTime);
        intervalEnd.setMinutes(intervalEnd.getMinutes() + 30);
        if (intervalEnd > endTime) break;
        intervals.push([new Date(startTime), new Date(intervalEnd)]);
        startTime = new Date(intervalEnd);
        startTime.setMinutes(startTime.getMinutes() + 2); // Add 2-minute break
      }

      return intervals;
    },
    getDateForDay(day, time) {
      const date = new Date();
      const daysOfWeek = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      date.setDate(
        date.getDate() + ((daysOfWeek[day] - date.getDay() + 7) % 7)
      );
      const [hours, minutes] = time.split(":");
      date.setHours(hours, minutes);
      return date;
    },
    confirmAppointment(props) {
      this.bookAppointment({
        date: props.eventDialogData.time.start.split(" ")[0],
        time:
          props.eventDialogData.time.start.split(" ")[1] +
          " - " +
          props.eventDialogData.time.end.split(" ")[1],
        gpId: props.eventDialogData.id,
        gpName: props.eventDialogData.gpName,
      });
      props.closeEventDialog();
    },
    generateUniqueId() {
      return Math.random().toString(36).substr(2, 9);
    },
    formatDate(dateString) {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      };
      return new Date(dateString).toLocaleString(undefined, options);
    },
  },
};
</script>

<style scoped>
.v-container {
  height: calc(100vh - 64px);
  padding: 20px;
}
.v-card {
  background-color: #ffffff;
  border-radius: 20px;
  width: 100%;
  margin: auto;
  overflow: hidden;
}
.calendar-container {
  width: 100%;
  height: 800px;
}
.custom-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dialog-title {
  font-size: 18px;
  font-weight: bold;
}
.dialog-close {
  cursor: pointer;
}
.dialog-content {
  margin-top: 12px;
}
.dialog-time {
  font-size: 16px;
  margin-bottom: 8px;
}
.dialog-gp {
  display: flex;
  align-items: center;
}
.dialog-gp v-icon {
  margin-right: 8px;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
