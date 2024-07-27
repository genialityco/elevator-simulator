import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { SensorContext, SensorDispatchContext, formatBytes } from "../SensorContextProvider";
import { database, auth } from "../../firebase";
import { ref, set } from "firebase/database";

const MenuHumanChain = () => {
  const navigate = useNavigate();
  const sensorData = useContext(SensorContext);
  const setSensorData = useContext(SensorDispatchContext);

  const handleManualModeChange = (event) => {
    const isChecked = event.target.checked;
    setSensorData(prevState => ({ ...prevState, manualMode: isChecked }));
    updateFirebase(isChecked, sensorData.connectedPeople, sensorData.maxPeople, sensorData.baseDuration, sensorData.targetDuration);
  };

  const handleConnectedPeopleChange = (event) => {
    const value = Number(event.target.value);
    setSensorData(prevState => ({ ...prevState, connectedPeople: value }));
    updateFirebase(sensorData.manualMode, value, sensorData.maxPeople, sensorData.baseDuration, sensorData.targetDuration);
  };

  const handleMaxPeopleChange = (event) => {
    const value = Number(event.target.value);
    setSensorData(prevState => ({ ...prevState, maxPeople: value }));
    updateFirebase(sensorData.manualMode, sensorData.connectedPeople, value, sensorData.baseDuration, sensorData.targetDuration);
  };

  const handleBaseDurationChange = (event) => {
    const value = Number(event.target.value);
    setSensorData(prevState => ({ ...prevState, baseDuration: value }));
    updateFirebase(sensorData.manualMode, sensorData.connectedPeople, sensorData.maxPeople, value, sensorData.targetDuration);
  };

  const handleTargetDurationChange = (event) => {
    const value = Number(event.target.value);
    setSensorData(prevState => ({ ...prevState, targetDuration: value }));
    updateFirebase(sensorData.manualMode, sensorData.connectedPeople, sensorData.maxPeople, sensorData.baseDuration, value);
  };

  const updateFirebase = (manualMode, connectedPeople, maxPeople, baseDuration, targetDuration) => {
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `manualModeSettings`);
      set(userRef, {
        manualMode,
        connectedPeople,
        maxPeople,
        baseDuration,
        targetDuration,
      });
    }
  };

  const updateConstanteDeConversion = (value) => {
    setSensorData(prevState => ({ ...prevState, constanteConversionSensorAPersonas: value }));
    const user = auth.currentUser;
    if (user) {
      const userRef = ref(database, `constanteDeConversion`);
      set(userRef, value);
    }
  };

  let initUSB = async () => {
    let port = await navigator.serial.requestPort();
    setSensorData(prevState => ({ ...prevState, port: port }));
  };

  let openComPort = async (port) => {
    if (!port?.readable) {
      try {
        await port.open({
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: "none",
          flowControl: "none",
        });
        setSensorData(prevState => ({ ...prevState, port: port }));
      } catch (e) {
        console.log("Error >> ", e);
      }
    }
  };

  let accessReader = async (port) => {
    console.log(await readUntilClosed(port));
  };

  let keepReading = true;
  async function readUntilClosed(port) {
    let decoder = new TextDecoder();

    while (port.readable && keepReading) {
      let reader = sensorData.reader;
      if (!reader) {
        reader = port.readable.getReader();
        setSensorData(prevState => ({ ...prevState, reader: reader }));
      }

      let buffer = "";
      var separateLines = [];
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          let dato = decoder.decode(value);
          buffer = buffer + dato;
          let salida = "";
          let sensoresdecodificados = {};
          separateLines = buffer.split(/\r\n/g);
          if (separateLines.length > 1) {
            salida = separateLines[0];
            sensoresdecodificados = JSON.parse(salida);

            setSensorData(prevState => {
              let reshistorico = prevState.valores.reshistorico;
              reshistorico.unshift(sensoresdecodificados.ressimple);
              reshistorico.pop();

              sensoresdecodificados.reshistorico = reshistorico;
              let promedio = reshistorico.reduce((a, b) => a + b) / reshistorico.length;
              promedio = Math.round(promedio / 25000) * 25000;
              sensoresdecodificados.respromedio = promedio;

              return { ...prevState, valores: sensoresdecodificados };
            });
            buffer = separateLines[separateLines.length - 1];
          }
        }
      } catch (error) {
      } finally {
        reader.releaseLock();
      }
    }
    await port.close();
  }

  return (
    <div className="container-global">
      <div className="subcontainer-global">
        <h1>Cadena humana</h1>
        <button style={{ width: "50vw", marginBlock: "10px" }} onClick={() => navigate("/loadingescene")}>
          Vista de carga
        </button>

        <div>
          <button onClick={() => initUSB()}>Init USB</button>

          <button disabled={!sensorData?.port} onClick={() => openComPort(sensorData.port)}>
            Open Port
          </button>

          <button disabled={!sensorData?.port?.readable} onClick={() => accessReader(sensorData.port)}>
            Empezar a leer
          </button>
        </div>

        <div className="display-flex">
          <div className="margin-right-15">
            <label className="display-flex flex-direction-column">
              Constante de conversión
              <input type="number" value={sensorData.constanteConversionSensorAPersonas} onChange={(e) => updateConstanteDeConversion(Number(e.target.value))} className="input-global" />
            </label>

            <p>
              Puerto: {JSON.stringify(sensorData?.port?.getInfo()) || "Ninguno"}
            </p>
            <p>Puerto abierto: {sensorData?.port?.readable ? "Si" : "No"} </p>

            <hr></hr>

            <p>Voltaje: {sensorData.valores.vout} - {(sensorData.valores.vout * 5) / 1024}</p>
            <p>resistencia: {sensorData.valores.resistencia} - {formatBytes(sensorData.valores.resistencia)}</p>
            <p>ressimpple: {sensorData.valores.ressimple} - {formatBytes(sensorData.valores.ressimple)}</p>
            <p>respromedio: {sensorData.valores.respromedio} - {formatBytes(sensorData.valores.respromedio)}</p>
            <p>resarray: {JSON.stringify(sensorData.valores.reshistorico)} </p>
          </div>

          <div className="display-flex flex-direction-column margin-right-15">
            <label className="margin-block-15">
              <input type="checkbox" checked={sensorData.manualMode} onChange={handleManualModeChange} />
              Activar modo manual
            </label>
            <div>
              <label className="display-flex flex-direction-column">
                Personas conectadas
                <input type="number" min={0} value={sensorData.connectedPeople} onChange={handleConnectedPeopleChange} className="input-global" />
              </label>
              <label className="display-flex flex-direction-column">
                Maximo de personas
                <input type="number" value={sensorData.maxPeople} onChange={handleMaxPeopleChange} className="input-global" />
              </label>
              <label className="display-flex flex-direction-column">
                Duracion base
                <input type="number" value={sensorData.baseDuration} onChange={handleBaseDurationChange} className="input-global" />
              </label>
              <label className="display-flex flex-direction-column">
                Duración estimada
                <input type="number" value={sensorData.targetDuration} onChange={handleTargetDurationChange} className="input-global" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuHumanChain;
