import React, { useEffect, useRef, useState, useContext, useCallback } from "react";
import "./LoadingScene.css";
import { SensorContext, SensorDispatchContext, formatBytes } from "../SensorContextProvider";
import { database } from "../../firebase";
import { ref, onValue, set } from "firebase/database";

const LoadingScene = () => {
  const sensorData = useContext(SensorContext);
  const setSensorData = useContext(SensorDispatchContext);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);
  const [audioStartChargePlay, setAudioStartChargePlay] = useState(false);
  const videoRef = useRef(null);
  const audioFinishRef = useRef(null);
  const audioStartCharge = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  const updateLoadingPercentage = useCallback(() => {
    const video = videoRef.current;
    if (video && video.playbackRate >= 0.1) {
      const currentTime = video.currentTime;
      const percentage = (currentTime / video.duration) * 100;
      setLoadingPercentage(percentage);
    }
  }, []);

  useEffect(() => {
    const manualModeRef = ref(database, `manualModeSettings`);
    onValue(manualModeRef, (snapshot) => {
      if (snapshot.val().manualMode) {
        setSensorData(prevState => ({
          ...prevState,
          manualMode: snapshot.val().manualMode,
          connectedPeople: snapshot.val().connectedPeople,
          maxPeople: snapshot.val().maxPeople,
          baseDuration: snapshot.val().baseDuration,
          targetDuration: snapshot.val().targetDuration
        }));
      }
    });
  }, []);

  useEffect(() => {
    const constanteConversionSensorAPersonasRef = ref(database, "constanteDeConversion");
    onValue(constanteConversionSensorAPersonasRef, (snapshot) => {

      setSensorData(prevState => ({ ...prevState, constanteConversionSensorAPersonas: snapshot.val() }));
    });
  }, []);

  useEffect(() => {
    if (sensorData.valores.respromedio > 50000000) {
      setSensorData(prevState => ({ ...prevState, connectedPeople: 0 }));
      return;
    }

    if (!sensorData.manualMode) {
      let numeropersonas = Math.round(sensorData.valores.respromedio / sensorData.constanteConversionSensorAPersonas);
      setSensorData(prevState => ({ ...prevState, connectedPeople: numeropersonas }));
    }
  }, [sensorData.valores.respromedio, sensorData.manualMode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const basePlaybackRate = sensorData.baseDuration / sensorData.targetDuration;
    const playbackRate = (sensorData.connectedPeople * basePlaybackRate) / sensorData.maxPeople;

    if (playbackRate >= 0.07) {
      video.playbackRate = Math.round(playbackRate * 100) / 100;
      if (!audioStartChargePlay) {
        audioStartCharge.current.play();
        setAudioStartChargePlay(true);
        setTimeout(() => {
          video.play();
        }, 4000);
      } else {
        video.play();
      }
    } else {
      video.pause();
    }

    video.addEventListener("timeupdate", updateLoadingPercentage);

    return () => {
      video.removeEventListener("timeupdate", updateLoadingPercentage);
    };
  }, [
    sensorData.connectedPeople,
    sensorData.maxPeople,
    sensorData.targetDuration,
    sensorData.baseDuration,
    audioStartChargePlay,
    updateLoadingPercentage,
  ]);

  useEffect(() => {
    const video = videoRef.current;

    const handlePlay = () => {
      if (!intervalRef.current) {
        intervalRef.current = setInterval(() => {
          setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
        }, 1000);
      }
    };

    const handleEnded = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    if (video) {
      video.addEventListener("play", handlePlay);
      video.addEventListener("ended", handleEnded);
    }

    return () => {
      if (video) {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("ended", handleEnded);
      }
    };
  }, []);

  useEffect(() => {
    if (loadingPercentage >= 90) {
      if (audioFinishRef.current) {
        audioFinishRef.current.play();
      }
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowVideo(false);
    }
  }, [loadingPercentage]);

  const batteryChargePercentage = (sensorData.connectedPeople / sensorData.maxPeople) * 100;

  return (
    <div className="loading-scene">
      <audio ref={audioStartCharge} src="/humanchain/charging.mp3" />
      <audio ref={audioFinishRef} src="/humanchain/shield-recharging.mp3" />

      <button className="restart-button" onClick={() => window.location.reload()}>
        Reiniciar
      </button>

      <video
        src="/humanchain/EXPERIENCIA_UNION_PH-BN.mp4"
        autoPlay
        muted
        loop
        className="background-video-bn"
        loading="lazy"
      />
      <video
        src="/humanchain/EXPERIENCIA_UNION_PH_COLOR.mp4"
        autoPlay
        muted
        loop
        className="background-video-color"
        style={{ opacity: loadingPercentage / 100 }}
        loading="lazy"
      />

      {showVideo && (
        <video
          src="/humanchain/EXPERIENCIA_CIUDAD_REV3.mp4"
          autoPlay
          className="show-video"
          loading="eager"
        />
      )}

      {!audioStartChargePlay && (
        <div className="prompt-connection">
          <p>¡Todos conectados, démonos las manos y formemos una Cadena humana!</p>
        </div>
      )}

      <div className="main-video-container">
        <video
          ref={videoRef}
          src="/humanchain/0723_2-cut.mp4"
          muted
          className="main-video"
          loading="eager"
        />
      </div>
      <div className="loading-percentage">{`Loading: ${loadingPercentage.toFixed(2)}%`}</div>
      <div className="battery-charge-bar">
        <div className="battery-charge-level" style={{ width: `${batteryChargePercentage}%` }} />
      </div>
      <div className="people-percentage">{`Porcentaje de personas: ${batteryChargePercentage.toFixed(2)}%`}</div>

      {!audioStartChargePlay && sensorData.connectedPeople > 0 && (
        <div className="not-enough-people">
          <span>¡Faltan personas para comenzar la carga de energía!</span>
        </div>
      )}

      {audioStartChargePlay && (
        <div className="elapsed-time">
          <span>{`Tiempo transcurrido: ${elapsedTime} segundos`}</span>
        </div>
      )}
    </div>
  );
};

export default LoadingScene;
