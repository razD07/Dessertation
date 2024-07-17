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

export const getUserTypeFromToken = (token) => {
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.userType;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getUserIdFromToken = (token) => {
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.id;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
