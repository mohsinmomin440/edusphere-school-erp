import axios from 'axios';

export const login = async (payload: { email: string; password: string }) => {
  const response = await axios.post('/api/v1/auth/login', payload, {
    withCredentials: true,
  });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post('/api/v1/auth/logout', {}, {
    withCredentials: true,
  });
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get('/api/v1/auth/me', {
    withCredentials: true,
  });
  return response.data;
};
