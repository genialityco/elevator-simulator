// src/atoms/elevatorAtom.js
import { atom } from "jotai";

export const elevatorStateAtom = atom("idle"); // Estados: "idle", "movingUp", "emergency", "repaired"
