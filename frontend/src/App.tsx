import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Loader } from './components/ui/Loader';
import { rehydrateAuth, useQuizStore } from './store/quizStore';
import { AIAssistant } from './pages/AIAssistant';
import { Dashboard } from './pages/Dashboard';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Quiz } from './pages/Quiz';
import { Register } from './pages/Register';
import { Results } from './pages/Results';

interface AuthGuardProps {
  authReady: boolean;
  children: JSX.Element;
}

const AuthGuard = ({ authReady, children }: AuthGuardProps) => {
  const isAuthenticated = useQuizStore((state) => state.isAuthenticated);

  if (!authReady) {
    return <Loader fullScreen label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await rehydrateAuth();
      setAuthReady(true);
    };

    void init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/quiz"
          element={
            <AuthGuard authReady={authReady}>
              <Quiz />
            </AuthGuard>
          }
        />
        <Route
          path="/results/:id"
          element={
            <AuthGuard authReady={authReady}>
              <Results />
            </AuthGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthGuard authReady={authReady}>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/assistant"
          element={
            <AuthGuard authReady={authReady}>
              <AIAssistant />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
