import React from "react";
import { useNavigate } from "react-router-dom";

const MenuHumanChain = () => {
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
        <h1>Cadena humana</h1>
        <button
          style={{ width: "50vw", marginBlock: "10px" }}
          onClick={() => navigate("/loadingescene")}
        >
          Vista de carga
        </button>
      </div>
    </div>
  );
};

export default MenuHumanChain;
