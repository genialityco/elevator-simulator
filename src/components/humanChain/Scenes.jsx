import React, { useState } from "react";
import LoadingScene from "./LoadingScene";
import SceneOne from "./SceneOne";

const Scenes = () => {
  const [scene, setScene] = useState(1);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3%",
          left: "1%",
          zIndex: 10,
          color: "black",
          borderRadius: "5px",
        }}
      >
        <button
          onClick={() => setScene(1)}
          style={{ backgroundColor: "transparent", fontSize: "0.8rem" }}
        >
          1
        </button>
        <button
          onClick={() => setScene(2)}
          style={{ backgroundColor: "transparent", fontSize: "0.8rem" }}
        >
          2
        </button>
      </div>

      {scene === 1 && <SceneOne />}
      {scene === 2 && <LoadingScene />}
    </div>
  );
};

export default Scenes;
