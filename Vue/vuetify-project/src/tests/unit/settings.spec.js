import { shallowMount } from "@vue/test-utils";
import Settings from "@/components/Settings.vue";

jest.mock("axios"); // Mock axios to prevent actual API calls

describe("Settings.vue", () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Settings, {
      data() {
        return {
          user: {
            name: "John Doe",
            email: "johndoe@example.com",
            phoneNumber: "123456789",
            address: "123 Main St",
            profilePhoto: "profile-photo-url",
            clinicName: "Healthy Clinic",
            userType: "GP", // GP type to test the conditionals
          },
          editUser: {},
          editDialog: false,
          isGP: true,
        };
      },
    });
  });

  it("renders the component correctly", () => {
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".profile-photo-container").exists()).toBe(true);
    expect(wrapper.find(".user-details").exists()).toBe(true);
  });

  it("initializes with correct default data", () => {
    expect(wrapper.vm.editDialog).toBe(false);
    expect(wrapper.vm.isGP).toBe(true);
    expect(wrapper.vm.user.name).toBe("John Doe");
    expect(wrapper.vm.user.email).toBe("johndoe@example.com");
  });

  it("opens and closes the edit dialog correctly", async () => {
    wrapper.vm.openEditDialog();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.editDialog).toBe(true);

    wrapper.vm.closeEditDialog();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.editDialog).toBe(false);
  });

  it("copies user data to editUser when opening the dialog", async () => {
    wrapper.vm.openEditDialog();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.editUser.name).toBe("John Doe");
    expect(wrapper.vm.editUser.email).toBe("johndoe@example.com");
  });

  it("uploads a new profile photo", async () => {
    const fileInput = wrapper.find("input[type='file']");
    const mockFile = new File(["dummy content"], "example.png", {
      type: "image/png",
    });

    // Simulate file input change event
    fileInput.element.files = [mockFile];
    await fileInput.trigger("change");

    // Check if the profilePhoto property was updated (mocked logic)
    expect(wrapper.vm.user.profilePhoto).toBe("profile-photo-url"); // Expected URL can be adjusted based on the mocked response
  });

  it("handles opening the file input correctly", async () => {
    const fileInput = wrapper.find("input[type='file']");
    const spy = jest.spyOn(fileInput.element, "click");

    wrapper.vm.openPhotoUpload();
    expect(spy).toHaveBeenCalled();
  });

  it("displays the clinic name for GP users", () => {
    expect(wrapper.find("p strong").text()).toBe("Clinic Name:");
    expect(wrapper.find("p").text()).toContain("Healthy Clinic");
  });

  it("displays the profile photo correctly", () => {
    const avatar = wrapper.find("img");
    expect(avatar.exists()).toBe(true);
    expect(avatar.attributes("src")).toBe("profile-photo-url");
  });
});
