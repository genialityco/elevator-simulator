// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import ButtonView from './components/elevator/ButtonView';
import VideoView from './components/elevator/VideoView';
import MenuElevator from './components/elevator/MenuElevator';
import MenuHumanChain from './components/humanChain/MenuHumanChain';
import LoadingScene from './components/humanChain/LoadingScene';
import { auth, signInAnonymously, onAuthStateChanged } from './firebase';
import Scenes from './components/humanChain/Scenes';

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
        <Route path='/menuelevator' element={<MenuElevator />} />
        <Route path="/buttonselevator" element={<ButtonView />} />
        <Route path="/videoselevator" element={<VideoView />} />
        <Route path="/menuhumanchain" element={<MenuHumanChain />} />
        <Route path='/loadingescene' element={<Scenes />} />
      </Routes>
    </Router>
  );
}

export default App;
