import { shallowMount } from "@vue/test-utils";
import Register from "@/components/Register.vue";
import useVuelidate from "@vuelidate/core";

jest.mock("axios"); // Mock axios to prevent actual API calls

describe("Register.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Register, {
      setup() {
        return {
          v$: useVuelidate(),
        };
      },
    });
  });

  it("renders the component correctly", () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".login-container").exists()).toBe(true);
  });

  it("initializes with correct default data", () => {
    expect(wrapper.vm.showPassword).toBe(false);
    expect(wrapper.vm.tab).toBe("tab-1");
    expect(wrapper.vm.gpForm.name).toBe("");
    expect(wrapper.vm.publicForm.name).toBe("");
  });

  it("toggles password visibility", async () => {
    expect(wrapper.vm.showPassword).toBe(false);
    wrapper.vm.togglePasswordVisibility();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.showPassword).toBe(true);
  });

  it("switches between tabs correctly", async () => {
    expect(wrapper.vm.tab).toBe("tab-1");
    wrapper.setData({ tab: "tab-2" });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.tab).toBe("tab-2");
  });

  it("validates GP form correctly", async () => {
    wrapper.vm.gpForm.name = "Dr. Raz";
    wrapper.vm.gpForm.email = "drRaz@example.com";
    wrapper.vm.gpForm.clinicName = "Healthy Clinic";
    wrapper.vm.gpForm.phoneNumber = "123456789";
    wrapper.vm.gpForm.address = "123 Main St";
    wrapper.vm.gpForm.password = "password123";
    wrapper.vm.gpForm.confirmPassword = "password123";

    await wrapper.vm.$v.gpForm.$touch();
    expect(wrapper.vm.v$.gpForm.$invalid).toBe(false);
  });

  it("shows validation errors when GP form fields are invalid", async () => {
    wrapper.vm.gpForm.name = "";
    wrapper.vm.gpForm.email = "invalid-email";
    wrapper.vm.gpForm.clinicName = "";
    wrapper.vm.gpForm.phoneNumber = "";
    wrapper.vm.gpForm.address = "";
    wrapper.vm.gpForm.password = "pass";
    wrapper.vm.gpForm.confirmPassword = "differentpassword";

    await wrapper.vm.$v.gpForm.$touch();
    expect(wrapper.vm.v$.gpForm.$invalid).toBe(true);

    const gpFormErrors = wrapper.vm.gpFormErrors;

    expect(gpFormErrors.name.length).toBeGreaterThan(0);
    expect(gpFormErrors.email.length).toBeGreaterThan(0);
    expect(gpFormErrors.clinicName.length).toBeGreaterThan(0);
    expect(gpFormErrors.phoneNumber.length).toBeGreaterThan(0);
    expect(gpFormErrors.address.length).toBeGreaterThan(0);
    expect(gpFormErrors.password.length).toBeGreaterThan(0);
    expect(gpFormErrors.confirmPassword.length).toBeGreaterThan(0);
  });

  it("validates Public form correctly", async () => {
    wrapper.vm.publicForm.name = "raz D";
    wrapper.vm.publicForm.email = "razdoe@example.com";
    wrapper.vm.publicForm.phoneNumber = "987654321";
    wrapper.vm.publicForm.address = "456 Elm St";
    wrapper.vm.publicForm.dob = "2000-01-01";
    wrapper.vm.publicForm.password = "password123";
    wrapper.vm.publicForm.confirmPassword = "password123";

    await wrapper.vm.$v.publicForm.$touch();
    expect(wrapper.vm.v$.publicForm.$invalid).toBe(false);
  });

  it("shows validation errors when Public form fields are invalid", async () => {
    wrapper.vm.publicForm.name = "";
    wrapper.vm.publicForm.email = "invalid-email";
    wrapper.vm.publicForm.phoneNumber = "";
    wrapper.vm.publicForm.address = "";
    wrapper.vm.publicForm.dob = "";
    wrapper.vm.publicForm.password = "pass";
    wrapper.vm.publicForm.confirmPassword = "differentpassword";

    await wrapper.vm.$v.publicForm.$touch();
    expect(wrapper.vm.v$.publicForm.$invalid).toBe(true);

    const publicFormErrors = wrapper.vm.publicFormErrors;

    expect(publicFormErrors.name.length).toBeGreaterThan(0);
    expect(publicFormErrors.email.length).toBeGreaterThan(0);
    expect(publicFormErrors.phoneNumber.length).toBeGreaterThan(0);
    expect(publicFormErrors.address.length).toBeGreaterThan(0);
    expect(publicFormErrors.dob.length).toBeGreaterThan(0);
    expect(publicFormErrors.password.length).toBeGreaterThan(0);
    expect(publicFormErrors.confirmPassword.length).toBeGreaterThan(0);
  });
});
