import React, { useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { elevatorStateAtom } from "../atoms/elevatorAtom";
import { database } from "../firebase";
import { ref, onValue, set } from "firebase/database";

const VideoView = () => {
  const [elevatorState, setElevatorState] = useAtom(elevatorStateAtom);
  const videoRef = useRef(null);

  useEffect(() => {
    const elevatorStateRef = ref(database, "elevatorState");
    onValue(elevatorStateRef, (snapshot) => {
      setElevatorState(snapshot.val());
    });
  }, [setElevatorState]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (
        video.currentTime >= 29 &&
        video.currentTime < 30 &&
        elevatorState === "movingUp"
      ) {
        set(ref(database, "elevatorState"), "emergencyLoop").catch((error) => {
          console.error("Error updating elevator state:", error);
        });
      }

      if (elevatorState === "emergencyLoop" && video.currentTime >= 38) {
        video.currentTime = 31;
      }

      if (elevatorState === "restart" && video.currentTime >= 19) {
        video.currentTime = 0;
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    if (elevatorState === "movingUp") {
      video.currentTime = 20;
      video.play();
    } else if (elevatorState === "emergencyLoop") {
      video.currentTime = 30;
      video.play();
    } else if (elevatorState === "repaired") {
      video.currentTime = 39;
      video.play();
    } else if (elevatorState === "restart") {
      video.currentTime = 0;
      video.play();
    } else if (elevatorState === "emergency") {
      video.pause();
    } else {
      video.pause();
      video.currentTime = 0;
    }

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [elevatorState]);

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
      <video
        ref={videoRef}
        src="/PH_ACSENSOR_COMPLETO_FULL.mp4"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

export default VideoView;
