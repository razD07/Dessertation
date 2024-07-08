import { mount } from "@vue/test-utils";
import Navbar from "@/components/navbar.vue";

describe("Navbar.vue", () => {
  it("renders correctly", () => {
    const wrapper = mount(Navbar);
    expect(wrapper.text()).toContain("GP Finder");
  });

  it("displays the user name", () => {
    const wrapper = mount(Navbar, {
      data() {
        return {
          userName: "John Doe",
        };
      },
    });
    expect(wrapper.text()).toContain("John Doe");
  });

  it("calls logout method on logout button click", async () => {
    const wrapper = mount(Navbar);
    const logoutMock = jest.fn();
    wrapper.setMethods({ logout: logoutMock });
    await wrapper.find("v-list-item").trigger("click");
    expect(logoutMock).toHaveBeenCalled();
  });
});
