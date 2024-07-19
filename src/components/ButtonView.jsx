import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { elevatorStateAtom } from "../atoms/elevatorAtom";
import { database, auth } from "../firebase";
import { ref, set, onValue } from "firebase/database";
import "../styles/ButtonView.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faStop, faWrench } from "@fortawesome/free-solid-svg-icons";

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
      }}
    >
      <div className="control-panel">
        <div
          onClick={() => handleButtonClick("repaired")}
          className="repair-icon"
        >
          <img
            src="/src/public/LOGOS_GEN.iality_web-15.svg"
            alt="Repair"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <button
          className={`elevator-button ${
            elevatorState === "movingUp" ? "moving-up" : ""
          } ${elevatorState === "emergencyLoop" ? "disabled" : ""}`}
          onClick={() => handleButtonClick("movingUp")}
          disabled={isDisabled}
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
        <button
          className={`elevator-button ${
            elevatorState === "emergencyLoop" ? "disabled" : ""
          }`}
          onClick={() => handleButtonClick("emergency")}
          disabled={isDisabled}
        >
          <FontAwesomeIcon icon={faStop} />
        </button>
      </div>
    </div>
  );
};

export default ButtonView;
