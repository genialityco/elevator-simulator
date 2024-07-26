import React, { useEffect, useRef, useState } from "react";
import "./LoadingScene.css";

const LoadingScene = () => {
  const [connectedPeople, setConnectedPeople] = useState(0);
  const [maxPeople, setMaxPeople] = useState(100);
  const [baseDuration, setBaseDuration] = useState(61);
  const [targetDuration, setTargetDuration] = useState(30);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);

  const [audioStartChargePlay, setAudioStartChargePlay] = useState(false);

  const videoRef = useRef(null);
  const audioFinishRef = useRef(null);
  const audioStartCharge = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const basePlaybackRate = baseDuration / targetDuration;
    const playbackRate = (connectedPeople * basePlaybackRate) / maxPeople;

    if (playbackRate >= 0.1) {
      video.playbackRate = playbackRate;
      if (!audioStartChargePlay) {
        audioStartCharge.current.play();
      }
      setAudioStartChargePlay(true);
      if (!audioStartChargePlay) {
        setTimeout(() => {
          video.play();
        }, 4000);
      } else {
        video.play();
      }
    }

    if (playbackRate === 0) {
      video.pause();
    }

    const updateLoadingPercentage = () => {
      if (video.playbackRate >= 0.1) {
        const currentTime = video.currentTime;
        const percentage = (currentTime / video.duration) * 100;
        setLoadingPercentage(percentage);
      }
    };

    video.addEventListener("timeupdate", updateLoadingPercentage);

    return () => {
      video.removeEventListener("timeupdate", updateLoadingPercentage);
    };
  }, [connectedPeople, maxPeople, targetDuration, baseDuration]);

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
  }, [videoRef.current]);

  useEffect(() => {
    if (loadingPercentage >= 90) {
      if (audioFinishRef.current) {
        audioFinishRef.current.play();
      }
      const timer = setTimeout(() => {
        setShowVideo(true);
      }, 6500);
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
      <input
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
      />

      <button className="restart-button" onClick={() => restartExperience()}>
        Reiniciar
      </button>

      <video
        src="/humanchain/EXPERIENCIA_UNION_PH-BN.mp4"
        autoPlay
        muted
        loop
        className="background-video-bn"
      />
      <video
        src="/humanchain/EXPERIENCIA_UNION_PH_COLOR.mp4"
        autoPlay
        muted
        loop
        className="background-video-color"
        style={{ opacity: loadingPercentage / 100 }}
      />

      {showVideo && (
        <video
          src="/humanchain/EXPERIENCIA_CIUDAD_REV3.mp4"
          autoPlay
          className="show-video"
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
        />
      </div>
      <div className="loading-percentage">
        {`Loading: ${loadingPercentage.toFixed(2)}%`}
      </div>
      <div className="battery-charge-bar">
        <div
          className="battery-charge-level"
          style={{ width: `${batteryChargePercentage}%` }}
        />
      </div>
      <div className="people-percentage">
        {`Porcentaje de personas: ${batteryChargePercentage.toFixed(2)}%`}
      </div>

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
