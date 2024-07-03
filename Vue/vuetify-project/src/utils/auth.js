import { jwtDecode } from "jwt-decode";

export const getUserNameFromToken = (token) => {
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.name;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
