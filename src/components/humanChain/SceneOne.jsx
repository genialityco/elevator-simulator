import React, { useEffect, useRef, useState } from "react";

const SceneOne = () => {
  const audioStartCharge = useRef(null);

  useEffect(() => {
    audioStartCharge.current.play();
  }, []);

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
      <audio ref={audioStartCharge} src="/humanchain/PH-INTRO-CIERRE.mp3" />
      <video
        src="/humanchain/EXPERIENCIA_UNION_PH-BN.mp4"
        autoPlay
        muted
        loop
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "auto",
          left: "auto",
          zIndex: 10,
          padding: "5px",
          backgroundColor: "rgba(255, 255, 255, 0.5)",
          fontSize: '3.5rem',
          fontFamily: 'Arial',
          color: "black",
          borderRadius: "35px",
        }}
      >
        <span style={{padding: "10px"}}>ENTRE TODOS, <strong>TODO ES PHOSIBLE</strong></span>
      </div>
    </div>
  );
};

export default SceneOne;
