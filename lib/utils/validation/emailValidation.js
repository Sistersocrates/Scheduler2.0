
import { handleLoginError } from "@/lib/utils/errors/loginErrors";

export const validateRochesterEmail = (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@rochesterschools\.org$/;
    if (!emailRegex.test(email)) {
      throw new Error('Only @rochesterschools.org email addresses are allowed');
    }

    return true;
  } catch (error) {
    throw new Error(handleLoginError(error));
  }
};

export const validateEmailFormat = (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    return true;
  } catch (error) {
    throw new Error(handleLoginError(error));
  }
};

export const isRochesterEmail = (email) => {
  try {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@rochesterschools\.org$/;
    return emailRegex.test(email);
  } catch (error) {
    return false;
  }
};
