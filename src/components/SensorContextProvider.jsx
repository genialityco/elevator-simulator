import React, { createContext, useState } from "react";

// Crear dos contextos:
// SensorContext: para consultar el estado del contexto
// SensorDispatchContext: para mutar el estado del contexto
const SensorContext = createContext(undefined);
const SensorDispatchContext = createContext(undefined);

// Un "provider" se usa para encapsular solo los
// componentes que necesitan el estado en este contexto
function SensorProvider({ children }) {
  const [SensorDetails, setSensorDetails] = useState({
    Sensorname: "John Doe",
    port: null,
    reader: null,
    valores: {
      vout: 0,
      resistencia: 0,
      ressimple: 0,
      respromedio: 0,
      reshistorico: [0, 0, 0, 0]
    },
    manualMode: false,
    connectedPeople: 0,
    maxPeople: 100,
    baseDuration: 61,
    targetDuration: 30,
    constanteConversionSensorAPersonas: 180000,
  });

  return (
    <SensorContext.Provider value={SensorDetails}>
      <SensorDispatchContext.Provider value={setSensorDetails}>
        {children}
      </SensorDispatchContext.Provider>
    </SensorContext.Provider>
  );
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export { SensorProvider, SensorContext, SensorDispatchContext, formatBytes };
