import { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  const register = async (payload: RegisterPayload): Promise<User> => {
    try {
      setIsLoading(true);
      const { data } = await api.post<{ user: User; token: string }>('/auth/register', payload, {
        headers: {
          'X-Skip-Auth-Redirect': 'true'
        }
      });
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error as AxiosError;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (payload: LoginPayload): Promise<User> => {
    try {
      setIsLoading(true);
      const { data } = await api.post<{ user: User; token: string }>('/auth/login', payload, {
        headers: {
          'X-Skip-Auth-Redirect': 'true'
        }
      });
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (error) {
      throw error as AxiosError;
    } finally {
      setIsLoading(false);
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
      localStorage.removeItem('auth_token');
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
