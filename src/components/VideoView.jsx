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
      if (video.currentTime >= 10 && video.currentTime < 11) {
        set(ref(database, "elevatorState"), "emergencyLoop").catch((error) => {
          console.error("Error updating elevator state:", error);
        });
      }

      if (elevatorState === "emergencyLoop") {
        if (video.currentTime >= 19) {
          video.currentTime = 11;
        }
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);

    if (elevatorState === "movingUp" || elevatorState === "emergencyLoop") {
      video.play();
    } else if (elevatorState === "repaired") {
      video.currentTime = 19;
      video.play();
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
        src="/moving_up.mp4"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
};

export default VideoView;
