import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import { useQuizStore } from '../store/quizStore';
import { User } from '../types';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  age?: number;
  income?: number;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const setUser = useQuizStore((state) => state.setUser);
  const clearUser = useQuizStore((state) => state.clearUser);
  const setLoading = useQuizStore((state) => state.setLoading);
  const isLoading = useQuizStore((state) => state.isLoading);

  const register = async (payload: RegisterPayload): Promise<User> => {
    try {
      setLoading(true);
      const { data } = await api.post<{ user: User }>('/auth/register', payload, {
        headers: {
          'X-Skip-Auth-Redirect': 'true'
        }
      });
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error as AxiosError;
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload: LoginPayload): Promise<User> => {
    try {
      setLoading(true);
      const { data } = await api.post<{ user: User }>('/auth/login', payload, {
        headers: {
          'X-Skip-Auth-Redirect': 'true'
        }
      });
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error as AxiosError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout', null, {
        headers: {
          'X-Skip-Auth-Redirect': 'true'
        }
      });
    } finally {
      clearUser();
      navigate('/');
    }
  };

  return {
    register,
    login,
    logout,
    isLoading
  };
};
