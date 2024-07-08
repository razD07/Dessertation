import { mount } from "@vue/test-utils";
import WelcomeGP from "@/components/welcomeGP.vue";
import { getUserNameFromToken } from "@/utils/auth";

jest.mock("@/utils/auth", () => ({
  getUserNameFromToken: jest.fn(),
}));

describe("WelcomeGP.vue", () => {
  beforeEach(() => {
    getUserNameFromToken.mockReturnValue("John Doe");
  });

  it("displays the welcome message correctly", () => {
    const wrapper = mount(WelcomeGP);
    expect(wrapper.text()).toContain("Welcome to GP Dashboard");
  });

  it("sets the correct userName", () => {
    const wrapper = mount(WelcomeGP);
    expect(wrapper.vm.userName).toBe("John Doe");
  });
});
