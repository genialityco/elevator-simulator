// src/components/Menu.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Elevator Simulator</h1>
      <button onClick={() => navigate('/buttons')}>Button View</button>
      <button onClick={() => navigate('/videos')}>Video View</button>
    </div>
  );
};

export default Menu;
