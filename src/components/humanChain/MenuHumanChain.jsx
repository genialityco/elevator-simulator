import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SensorContext,
  SensorDispatchContext,
  formatBytes,
} from "../SensorContextProvider";
import { database, auth } from "../../firebase";
import { ref, set, onValue } from "firebase/database";

const MenuHumanChain = () => {
  const navigate = useNavigate();
  const sensorData = React.useContext(SensorContext);
  const sensorSet = React.useContext(SensorDispatchContext);

  // Estados para los inputs
  const [manualMode, setManualMode] = useState(false);
  const [connectedPeople, setConnectedPeople] = useState(0);
  const [maxPeople, setMaxPeople] = useState(100);
  const [baseDuration, setBaseDuration] = useState(61);
  const [targetDuration, setTargetDuration] = useState(30);

  // Función para manejar el cambio del checkbox
  const handleManualModeChange = (event) => {
    const isChecked = event.target.checked;
    setManualMode(isChecked);
    updateFirebase(
      isChecked,
      connectedPeople,
      maxPeople,
      baseDuration,
      targetDuration
    );
  };

  const handleConnectedPeopleChange = (event) => {
    const value = Number(event.target.value);
    setConnectedPeople(value);
    updateFirebase(manualMode, value, maxPeople, baseDuration, targetDuration);
  };

  const handleMaxPeopleChange = (event) => {
    const value = Number(event.target.value);
    setMaxPeople(value);
    updateFirebase(
      manualMode,
      connectedPeople,
      value,
      baseDuration,
      targetDuration
    );
  };

  const handleBaseDurationChange = (event) => {
    const value = Number(event.target.value);
    setBaseDuration(value);
    updateFirebase(
      manualMode,
      connectedPeople,
      maxPeople,
      value,
      targetDuration
    );
  };

  const handleTargetDurationChange = (event) => {
    const value = Number(event.target.value);
    setTargetDuration(value);
    updateFirebase(manualMode, connectedPeople, maxPeople, baseDuration, value);
  };

  const updateFirebase = (
    manualMode,
    connectedPeople,
    maxPeople,
    baseDuration,
    targetDuration
  ) => {
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

  let initUSB = async () => {
    let port = await navigator.serial.requestPort();
    console.log("port ", port);
    sensorSet((state) => {
      return { ...state, port: port };
    });
  };

  let openComPort = async (port) => {
    console.log(">> info puerto", port.getInfo());
    if (!port?.readable) {
      try {
        await port.open({
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: "none",
          flowControl: "none",
        });
        sensorSet((state) => {
          return { ...state, port: port };
        });
      } catch (e) {
        console.log("Error >> ", e);
      }
    }

    console.log(">> puerto abierto", port);
  };

  let accessReader = async (port) => {
    //var dispositivos = await navigator.usb.requestDevice({ filters: [] });
    //var devices = await navigator.usb.getDevices();
    //console.log('dispositivosss', devices);
    console.log(await readUntilClosed(port));
  };

  let keepReading = true;
  async function readUntilClosed(port) {
    let decoder = new TextDecoder();

    while (port.readable && keepReading) {
      let reader = sensorData.reader;
      if (!reader) {
        reader = port.readable.getReader();
        sensorSet((state) => {
          return { ...state, reader: reader };
        });
      }

      let buffer = "";
      var separateLines = [];
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // reader.cancel() has been called.
            break;
          }
          //
          // value is a Uint8Array.
          let dato = decoder.decode(value);
          buffer = buffer + dato;
          let salida = "";
          let sensoresdecodificados = {};
          //separateLines = buffer.split(/\r?\n|\r|\n/g);
          separateLines = buffer.split(/\r\n/g);
          // console.log('buffer', buffer);
          if (separateLines.length > 1) {
            salida = separateLines[0];
            sensoresdecodificados = JSON.parse(salida);
            //console.log(buffer, separateLines, salida, sensoresdecodificados);

            sensorSet((state) => {
              let reshistorico = state.valores.reshistorico;
              reshistorico.unshift(sensoresdecodificados.ressimple);
              reshistorico.pop();

              //Hacemos un promedio para que no varie tanto
              sensoresdecodificados.reshistorico = reshistorico;
              let promedio =
                reshistorico.reduce((a, b) => a + b) / reshistorico.length;

              //Hacemos que los cambios de valor sean en saltos de 25.000 minimo
              promedio = Math.round(promedio / 25000) * 25000;

              sensoresdecodificados.respromedio = promedio;

              return { ...state, valores: sensoresdecodificados };
            });
            buffer = separateLines[separateLines.length - 1];
          }
        }
      } catch (error) {
        // Handle error...
      } finally {
        // Allow the serial port to be closed later.
        reader.releaseLock();
      }
    }

    await port.close();
  }

  return (
    <div className="container-global">
      <div className="subcontainer-global">
        <h1>Cadena humana</h1>
        <button
          style={{ width: "50vw", marginBlock: "10px" }}
          onClick={() => navigate("/loadingescene")}
        >
          Vista de carga
        </button>

        <div>
          <button onClick={() => initUSB()}>Init USB</button>

          <button
            disabled={!sensorData?.port}
            onClick={() => openComPort(sensorData.port)}
          >
            Open Port
          </button>

          <button
            disabled={!sensorData?.port?.readable}
            onClick={() => accessReader(sensorData.port)}
          >
            Empezar a leer
          </button>
        </div>

        <div className="display-flex">
          <div className="margin-right-15">
            <p>
              Puerto: {JSON.stringify(sensorData?.port?.getInfo()) || "Ninguno"}{" "}
            </p>
            <p>Puerto abierto: {sensorData?.port?.readable ? "Si" : "No"} </p>

            <hr></hr>

            <p>
              Voltaje: {sensorData.valores.vout} -{" "}
              {(sensorData.valores.vout * 5) / 1024}
            </p>
            <p>
              resistencia: {sensorData.valores.resistencia} -{" "}
              {formatBytes(sensorData.valores.resistencia)}
            </p>
            <p>
              ressimpple: {sensorData.valores.ressimple} -{" "}
              {formatBytes(sensorData.valores.ressimple)}
            </p>
            <p>
              respromedio: {sensorData.valores.respromedio} -{" "}
              {formatBytes(sensorData.valores.respromedio)}
            </p>
            <p>resarray: {JSON.stringify(sensorData.valores.reshistorico)} </p>
          </div>

          <div className="display-flex flex-direction-column margin-right-15">
            <label className="margin-block-15">
              <input
                type="checkbox"
                checked={manualMode}
                onChange={handleManualModeChange}
              />
              Activar modo manual
            </label>
            <div>
              <label className="display-flex flex-direction-column">
                Personas conectadas
                <input
                  type="number"
                  min={0}
                  value={connectedPeople}
                  onChange={handleConnectedPeopleChange}
                  className="input-global"
                />
              </label>
              <label className="display-flex flex-direction-column">
                Maximo de personas
                <input
                  type="number"
                  value={maxPeople}
                  onChange={handleMaxPeopleChange}
                  className="input-global"
                />
              </label>
              <label className="display-flex flex-direction-column">
                Duracion base
                <input
                  type="number"
                  value={baseDuration}
                  onChange={handleBaseDurationChange}
                  className="input-global"
                />
              </label>
              <label className="display-flex flex-direction-column">
                Duración estimada
                <input
                  type="number"
                  value={targetDuration}
                  onChange={handleTargetDurationChange}
                  className="input-global"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuHumanChain;
