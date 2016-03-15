export const UPDATE_USER = 'UPDATE_USER';

export const updateUser = (user) => {
  return {
    type : 'UPDATE_USER',
    email: email
  };
};

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE'

// Resets the currently visible error message.
export function resetErrorMessage() {
  return {
    type: RESET_ERROR_MESSAGE
  }
}
