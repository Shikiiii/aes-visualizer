"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  MoveRight,
  RefreshCw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  aesEncrypt,
  arrayBufferToHex,
  matrixToArrayBuffer,
  stringToArrayBuffer,
} from "../lib/aes-crypto";

interface AESVisualizerProps {
  plaintext: string;
  encryptionKey: string;
  currentStep: number;
  animationPhase: number;
}

export function AESVisualizer({
  plaintext,
  encryptionKey,
  currentStep,
  animationPhase,
}: AESVisualizerProps) {
  const [states, setStates] = useState<number[][][]>([]);
  const [roundKeys, setRoundKeys] = useState<number[][][]>([]);
  const [highlightCells, setHighlightCells] = useState<
    { i: number; j: number }[]
  >([]);
  const [showArrows, setShowArrows] = useState<boolean>(false);
  const [arrowType, setArrowType] = useState<string>("");
  const [exportData, setExportData] = useState<string>("");

  // Define which steps are AddRoundKey operations
  const addRoundKeySteps = [1, 5, 9];

  useEffect(() => {
    try {
      // Ensure plaintext and key are 16 characters (128 bits)
      const paddedPlaintext = plaintext.padEnd(16, " ");
      const paddedKey = encryptionKey.padEnd(16, " ");

      // Perform actual AES encryption
      const { states: encryptionStates, roundKeys: encryptionRoundKeys } =
        aesEncrypt(
          paddedPlaintext.substring(0, 16),
          paddedKey.substring(0, 16)
        );

      setStates(encryptionStates);
      setRoundKeys(encryptionRoundKeys);

      // Generate export data
      if (encryptionStates.length > 0) {
        const finalState = encryptionStates[encryptionStates.length - 1];
        const ciphertextBuffer = matrixToArrayBuffer(finalState);
        const ciphertextHex = arrayBufferToHex(ciphertextBuffer);
        const ivHex = "00000000000000000000000000000000"; // Zero IV for simplicity

        const exportObj = {
          algorithm: "AES-128-ECB", // We're using ECB mode (no IV) for simplicity
          plaintext: paddedPlaintext.substring(0, 16),
          key: paddedKey.substring(0, 16),
          plaintext_hex: arrayBufferToHex(
            stringToArrayBuffer(paddedPlaintext.substring(0, 16))
          ),
          key_hex: arrayBufferToHex(
            stringToArrayBuffer(paddedKey.substring(0, 16))
          ),
          ciphertext_hex: ciphertextHex,
          iv_hex: ivHex,
        };

        setExportData(JSON.stringify(exportObj, null, 2));
      }
    } catch (error) {
      console.error("Error during AES encryption:", error);
    }
  }, [plaintext, encryptionKey]);

  // Set highlights and arrows based on current step and animation phase
  useEffect(() => {
    // Reset highlights and arrows
    setHighlightCells([]);
    setShowArrows(false);
    setArrowType("");

    // Set highlights and arrows based on current step and animation phase
    if (animationPhase === 1) {
      // Show highlights for the current operation
      const highlights = [];

      if (currentStep === 0) {
        // Initial State
        // Highlight the first column to show column-wise arrangement
        highlights.push(
          { i: 0, j: 0 },
          { i: 1, j: 0 },
          { i: 2, j: 0 },
          { i: 3, j: 0 }
        );
        setArrowType("column");
      } else if (currentStep === 1 || currentStep === 5 || currentStep === 9) {
        // AddRoundKey
        // Highlight a cell to show XOR operation
        highlights.push({ i: 1, j: 1 });
        setArrowType("xor");
      } else if (currentStep === 2 || currentStep === 7) {
        // SubBytes
        // Highlight cells to show substitution
        highlights.push(
          { i: 0, j: 0 },
          { i: 1, j: 1 },
          { i: 2, j: 2 },
          { i: 3, j: 3 }
        );
        setArrowType("substitute");
      } else if (currentStep === 3 || currentStep === 8) {
        // ShiftRows
        // Highlight rows to show shifting
        highlights.push(
          { i: 1, j: 0 },
          { i: 1, j: 1 },
          { i: 1, j: 2 },
          { i: 1, j: 3 }
        );
        setArrowType("shift");
      } else if (currentStep === 4) {
        // MixColumns
        // Highlight a column to show mixing
        highlights.push(
          { i: 0, j: 0 },
          { i: 1, j: 0 },
          { i: 2, j: 0 },
          { i: 3, j: 0 }
        );
        setArrowType("mix");
      }

      setHighlightCells(highlights);
      setShowArrows(true);
    } else if (animationPhase === 2) {
      // Show the result of the operation
      setShowArrows(false);

      // For some operations, highlight all cells to show the complete transformation
      if (currentStep > 0 && currentStep < 11) {
        const allCells = [];
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            allCells.push({ i, j });
          }
        }
        setHighlightCells(allCells);
      }
    }
  }, [currentStep, animationPhase]);

  const handleExportData = () => {
    // Create a blob with the export data
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "aes-encryption-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Add a function to convert ArrayBuffer to Base64 after the handleExportData function
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  if (states.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        Един момент...
      </div>
    );
  }

  const currentState = states[Math.min(currentStep, states.length - 1)];

  // Find the corresponding round key for the current step
  let currentRoundKey: number[][] | undefined;
  if (currentStep === 1) {
    currentRoundKey = roundKeys[0];
  } else if (currentStep === 5) {
    currentRoundKey = roundKeys[1];
  } else if (currentStep === 9) {
    currentRoundKey = roundKeys[10];
  }

  // Map step numbers to operation names
  const getOperationName = (step: number) => {
    if (step === 0) return "Начално състояние";
    if (step === 1) return "Добавяне на кръгъл ключ (Начално)";
    if (step === 2) return "SubBytes";
    if (step === 3) return "ShiftRows";
    if (step === 4) return "MixColumns";
    if (step === 5) return "Добавяне на кръгъл ключ";
    if (step === 6) return "Повтаряне още 8 пъти";
    if (step === 7) return "Финал - SubBytes";
    if (step === 8) return "Финал - ShiftRows";
    if (step === 9) return "Финал - Добавяне на кръгъл ключ";
    if (step === 10) return "Шифъртекст";
    return "Завършено";
  };

  const currentOperation = getOperationName(currentStep);

  // Color mapping for different operations
  const getOperationColor = (operation: string) => {
    if (operation.includes("Начално състояние")) return "rgb(59, 130, 246)"; // blue
    if (operation.includes("Добавяне на кръгъл ключ"))
      return "rgb(16, 185, 129)"; // green
    if (operation.includes("SubBytes")) return "rgb(249, 115, 22)"; // orange
    if (operation.includes("ShiftRows")) return "rgb(236, 72, 153)"; // pink
    if (operation.includes("MixColumns")) return "rgb(139, 92, 246)"; // purple
    if (operation.includes("Шифъртекст")) return "rgb(234, 179, 8)"; // yellow
    if (operation.includes("Повтаряне")) return "rgb(107, 114, 128)"; // gray
    return "rgb(255, 255, 255)"; // white
  };

  const operationColor = getOperationColor(currentOperation);

  // Function to render arrows based on the current operation
  const renderArrows = () => {
    if (!showArrows) return null;

    switch (arrowType) {
      case "column":
        return (
          <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-10 relative text-white text-center"
            >
              <ArrowDown className="h-12 w-12 mx-auto text-blue-400" />
              <p className="mt-2 font-medium">Подреждане по колони</p>
            </motion.div>
          </div>
        );
      case "xor":
        return (
          <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-14 relative text-white text-center"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="bg-gray-700 p-2 rounded">State</div>
                </div>
                <div className="text-2xl">⊕</div>
                <div className="text-center">
                  <div className="bg-gray-700 p-2 rounded">Key</div>
                </div>
              </div>
              <ArrowDown className="h-8 w-8 mx-auto mt-2 text-green-400" />
              <p className="mt-2 font-medium">XOR операция</p>
            </motion.div>
          </div>
        );
      case "substitute":
        return (
          <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-14 relative text-white text-center"
            >
              <RefreshCw className="h-12 w-12 mx-auto text-orange-400" />
              <p className="mt-2 font-medium">Заместване с S-кутия</p>
            </motion.div>
          </div>
        );
      case "shift":
        return (
          <div className="relative top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-14 relative text-white text-center"
            >
              <MoveRight className="h-12 w-12 mx-auto text-pink-400" />
              <p className="mt-2 font-medium">Shift Rows</p>
            </motion.div>
          </div>
        );
      case "mix":
        return (
          <div className="relative top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-14 relative text-white text-center"
            >
              <ArrowUpRight className="h-12 w-12 mx-auto text-purple-400" />
              <p className="mt-2 font-medium">Mix Columns</p>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  // Check if a cell should be highlighted
  const isHighlighted = (i: number, j: number) => {
    return highlightCells.some((cell) => cell.i === i && cell.j === j);
  };

  // Check if the current step is an AddRoundKey step
  const isAddRoundKeyStep = addRoundKeySteps.includes(currentStep);

  return (
    <div className="flex flex-col items-center relative">
      <h3
        className="text-2xl font-semibold mb-6"
        style={{ color: operationColor }}
      >
        {currentOperation}
      </h3>

      <div className="relative">
        <div className="grid grid-cols-4 gap-2 mb-8">
          {currentState.map((row, i) =>
            row.map((value, j) => (
              <motion.div
                key={`state-${i}-${j}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  backgroundColor: isHighlighted(i, j)
                    ? operationColor
                    : "rgba(75, 85, 99, 0.8)",
                  borderColor: isHighlighted(i, j)
                    ? operationColor
                    : "transparent",
                  borderWidth: isHighlighted(i, j) ? "2px" : "0px",
                  zIndex: isHighlighted(i, j) ? 10 : 1,
                }}
                transition={{ duration: 0.3, delay: (i * 4 + j) * 0.02 }}
                className="w-16 h-16 flex items-center justify-center rounded-md text-black font-mono relative"
              >
                <div className="text-center">
                  <div className="text-xs text-white/70">
                    ({i},{j})
                  </div>
                  <div className="font-bold text-white">
                    {value.toString(16).padStart(2, "0").toUpperCase()}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {renderArrows()}

        {/* Use isAddRoundKeyStep to determine when to show the round key */}
        {isAddRoundKeyStep &&
          animationPhase === 1 &&
          currentRoundKey &&
          currentRoundKey.length > 0 && (
            <div className="relative top-full left-0 right-0">
              <h4 className="text-lg font-medium mb-2 text-center">
                Round Key
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {currentRoundKey.map((row, i) =>
                  row.map((value, j) => (
                    <motion.div
                      key={`key-${i}-${j}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        backgroundColor: isHighlighted(i, j)
                          ? "rgba(16, 185, 129, 0.3)"
                          : "rgba(75, 85, 99, 0.5)",
                      }}
                      transition={{ duration: 0.3, delay: (i * 4 + j) * 0.02 }}
                      className="w-12 h-12 flex items-center justify-center rounded-md text-white font-mono text-sm"
                    >
                      {value.toString(16).padStart(2, "0").toUpperCase()}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
      </div>

      {currentStep === 10 && currentState && (
        <div className="mt-6 text-center">
          <h4 className="text-lg font-medium mb-2">Криптиран изход</h4>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-300 mb-1">Hex формат:</p>
              <p className="bg-gray-800 text-white px-4 py-2 rounded-md font-mono break-all inline-block">
                {currentState
                  .flat()
                  .map((val) => val.toString(16).padStart(2, "0").toUpperCase())
                  .join(" ")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-300 mb-1">Base64 формат:</p>
              <p className="bg-gray-800 text-white px-4 py-2 rounded-md font-mono break-all inline-block">
                {arrayBufferToBase64(matrixToArrayBuffer(currentState))}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={handleExportData}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="mr-2 h-4 w-4" /> Експортиране на данни за
              декриптиране
            </Button>
            <p className="text-sm text-gray-400 mt-2">
              Експортирайте данните, за да декриптирате с външен инструмент
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl bg-gray-700/50 rounded-lg p-4 mt-8">
        <h4 className="text-lg font-medium mb-2">Матрично представяне</h4>
        <div className="font-mono text-sm overflow-x-auto whitespace-pre">
          {currentState
            .map(
              (row) =>
                `[ ${row
                  .map((val) => val.toString(16).padStart(2, "0").toUpperCase())
                  .join(" ")} ]\n`
            )
            .join("")}
        </div>
      </div>
    </div>
  );
}
