import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { elevatorStateAtom } from "../../atoms/elevatorAtom";
import { database, auth } from "../../firebase";
import { ref, set, onValue } from "firebase/database";
import "../../styles/ButtonView.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";

const ButtonView = () => {
  const [elevatorState, setElevatorState] = useAtom(elevatorStateAtom);

  useEffect(() => {
    const elevatorStateRef = ref(database, "elevatorState");
    onValue(elevatorStateRef, (snapshot) => {
      setElevatorState(snapshot.val());
    });
  }, [setElevatorState]);

  const handleButtonClick = (state) => {
    if (auth.currentUser) {
      setElevatorState(state);
      set(ref(database, "elevatorState"), state)
        .then(() => {
          console.log("Elevator state updated successfully");
        })
        .catch((error) => {
          console.error("Error updating elevator state:", error);
        });
    } else {
      console.error("User not authenticated");
    }
  };

  const isDisabled = elevatorState === "emergencyLoop";

  useEffect(() => {
    console.log("Elevator state:", elevatorState);
  }, [elevatorState]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundImage: "url(/images/FONDO.png)",
      }}
    >
      <div className="control-panel">
        <div
          onClick={() => handleButtonClick("repaired")}
          className="repair-icon"
        >
          <img
            src="/images/BOTON-LOGO.png"
            alt="Repair"
            style={{ width: "auto", height: "100%" }}
          />
        </div>

        <button
          className={`elevator-button-up ${
            elevatorState === "movingUp" || elevatorState === "repaired"
              ? "moving-up"
              : ""
          } ${elevatorState === "emergencyLoop" ? "disabled" : ""}`}
          onClick={() => handleButtonClick("movingUp")}
          disabled={isDisabled}
        ></button>

        <button
          className={`elevator-button-stop ${
            elevatorState === "emergencyLoop" ? "disabled" : ""
          } ${elevatorState === "emergency" ? "emergency" : ""}`}
          onClick={() => handleButtonClick("emergency")}
          disabled={isDisabled}
        ></button>
      </div>
      <button
        style={{
          position: "fixed",
          backgroundColor: "#b9b8bd",
          color: "black",
          bottom: 5,
          right: 5,
          borderRadius: "50%",
          fontSize: "1.5rem",
          width: "4rem",
          height: "4rem",
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          cursor: isDisabled ? "not-allowed" : "pointer",
          filter: isDisabled ? "opacity(0.5) grayscale(1)": "none",
        }}
        disabled={isDisabled}
        onClick={() => handleButtonClick("restart")}
      >
        <FontAwesomeIcon icon={faArrowsRotate} />
      </button>
      <button
        style={{
          position: "fixed",
          backgroundColor: "#b9b8bd",
          color: "black",
          top: 5,
          right: 5,
          borderRadius: "50%",
          fontSize: "1.5rem",
          width: "4rem",
          height: "4rem",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0,
          display: "flex",
        }}
        onClick={() => handleButtonClick("forceRestart")}
      >
        <FontAwesomeIcon icon={faArrowsRotate} />
      </button>
    </div>
  );
};

export default ButtonView;
