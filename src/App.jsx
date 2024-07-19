// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import ButtonView from './components/ButtonView';
import VideoView from './components/VideoView';
import { auth, signInAnonymously, onAuthStateChanged } from './firebase';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Autenticar usuario anónimamente con Firebase
    signInAnonymously(auth)
      .then(() => {
        console.log('User signed in anonymously');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Error signing in anonymously:', errorCode, errorMessage);
      });

    // Verificar el estado de autenticación
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Menu />} />
        <Route path="/buttons" element={<ButtonView />} />
        <Route path="/videos" element={<VideoView />} />
      </Routes>
    </Router>
  );
}

export default App;
