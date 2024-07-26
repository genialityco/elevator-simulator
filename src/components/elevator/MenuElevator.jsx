import React from "react";
import { useNavigate } from "react-router-dom";

const MenuElevator = () => {
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
        <h1>Simulador elevador</h1>
        <button
          style={{ width: "50vw", marginBlock: "10px" }}
          onClick={() => navigate("/buttonselevator")}
        >
          Vista de botones
        </button>
        <button
          style={{ width: "50vw", marginBlock: "10px" }}
          onClick={() => navigate("/videoselevator")}
        >
          Vista del video
        </button>
      </div>
    </div>
  );
};

export default MenuElevator;
