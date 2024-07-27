import React, { useEffect, useRef, useState, useCallback } from "react";
import "./LoadingScene.css";
import {
  SensorContext,
  SensorDispatchContext,
  formatBytes,
} from "../SensorContextProvider";
import { database } from "../../firebase";
import { ref, onValue, set } from "firebase/database";

const LoadingScene = () => {
  const sensorData = React.useContext(SensorContext);
  const [connectedPeople, setConnectedPeople] = useState(0);
  const [maxPeople, setMaxPeople] = useState(100);
  const [baseDuration, setBaseDuration] = useState(61);
  const [targetDuration, setTargetDuration] = useState(30);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [manualMode, setManualMode] = useState(false);
  const intervalRef = useRef(null);

  const [audioStartChargePlay, setAudioStartChargePlay] = useState(false);

  const [
    constanteConversionSensorAPersonas,
    setConstanteConversionSensorAPersonas,
  ] = useState(180000);

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
        setManualMode(snapshot.val().manualMode);
        setConnectedPeople(snapshot.val().connectedPeople);
      }
      setMaxPeople(snapshot.val().maxPeople);
      setBaseDuration(snapshot.val().baseDuration);
      setTargetDuration(snapshot.val().targetDuration);
    });
  }, [manualMode]);

  useEffect(() => {
    const constanteConversionSensorAPersonasRef = ref(
      database,
      "constanteDeConversion"
    );
    onValue(constanteConversionSensorAPersonasRef, (snapshot) => {
      console.log("Valor constante", snapshot.val())
      setConstanteConversionSensorAPersonas(snapshot.val());
    });
  }, []);

  useEffect(() => {
    console.log(
      "cambio detectado en respromedio",
      sensorData.valores.respromedio
    );
    //LIMITE SUPERIOR TEMPORAL un valor muy grande indica que nadie esta conectado
    //cuidado por que puede indicar muchos conectados
    if (sensorData.valores.respromedio > 50000000) {
      setConnectedPeople(0);
      return;
    }

    //El sensor esta calibrado para que mas o menos cada persona
    //sea 1millon en resistencia dependiendo de la cantidad de millones es la cantidad de personas
    //aqui escalamos el valor para que coincida con el valor de personas
    //cada millon en numero del sensor contamos una persona

    if (!manualMode) {
      console.log(constanteConversionSensorAPersonas)
      let numeropersonas = Math.round(
        sensorData.valores.respromedio / constanteConversionSensorAPersonas
      );
      console.log(
        "cambio detectado en respromedio",
        sensorData.valores.respromedio,
        numeropersonas
      );
      setConnectedPeople(numeropersonas);
    }
  }, [sensorData.valores.respromedio, manualMode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
  
    const basePlaybackRate = baseDuration / targetDuration;
    let playbackRate = (connectedPeople * basePlaybackRate) / maxPeople;
  
    // Limitar el playbackRate entre 0.5 y 4.0
    playbackRate = Math.max(0.5, Math.min(playbackRate, 4.0));
  
    if (playbackRate >= 0.07) {
      // Redondear a dos decimales
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
    connectedPeople,
    maxPeople,
    targetDuration,
    baseDuration,
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

  const batteryChargePercentage = (connectedPeople / maxPeople) * 100;

  return (
    <div className="loading-scene">
      <audio ref={audioStartCharge} src="/humanchain/charging.mp3" />
      <audio ref={audioFinishRef} src="/humanchain/shield-recharging.mp3" />
      {/* <input
        type="number"
        min={0}
        value={connectedPeople}
        onChange={(e) => setConnectedPeople(Number(e.target.value))}
        placeholder="Enter number of connected people"
        className="input-connected-people"
      />
      <input
        type="number"
        value={maxPeople}
        onChange={(e) => setMaxPeople(Number(e.target.value))}
        placeholder="Enter maximum number of people"
        className="input-max-people"
      />
      <input
        type="number"
        value={baseDuration}
        onChange={(e) => setBaseDuration(Number(e.target.value))}
        placeholder="Enter base duration"
        className="input-base-duration"
      />
      <input
        type="number"
        value={targetDuration}
        onChange={(e) => setTargetDuration(Number(e.target.value))}
        placeholder="Enter target duration"
        className="input-target-duration"
      /> */}

      <button
        className="restart-button"
        onClick={() => window.location.reload()}
      >
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
          <p>
            ¡Todos conectados, démonos las manos y formemos una Cadena humana!
          </p>
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
      <div className="loading-percentage">{`Loading: ${loadingPercentage.toFixed(
        2
      )}%`}</div>
      <div className="battery-charge-bar">
        <div
          className="battery-charge-level"
          style={{ width: `${batteryChargePercentage}%` }}
        />
      </div>
      <div className="people-percentage">{`Poder de carga: ${batteryChargePercentage.toFixed(
        2
      )}%`}</div>

      {!audioStartChargePlay && connectedPeople > 0 && (
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
