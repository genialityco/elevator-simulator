// src/components/Menu.js
import React from "react";
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignContent: "center",
          alignItems: "center",
        }}
      >
        <h1>Menú de experiencias</h1>
        <button
          style={{ width: "50vw", marginBlock: "10px" }}
          onClick={() => navigate("/menuelevator")}
        >
          Experiencia Ascensor
        </button>
        <button
          style={{ width: "50vw", marginBlock: "10px" }}
          onClick={() => navigate("/menuhumanchain")}
        >
          Experiencia Cadena Humana
        </button>
      </div>
    </div>
  );
};

export default Menu;
