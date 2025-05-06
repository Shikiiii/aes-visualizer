"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  MoveRight,
  RefreshCw,
  Download,
  MoveLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  aesEncrypt,
  arrayBufferToHex,
  matrixToArrayBuffer,
  stringToArrayBuffer,
  sBox as aesSBox,
  mixColumns as mixColumnsAES
} from "../lib/aes-crypto";

interface AESVisualizerProps {
  plaintext: string;
  encryptionKey: string;
  currentStep: number;
  animationPhase: number;
  actualCurrentStep: number;
}

export function AESVisualizer({
  plaintext,
  encryptionKey,
  currentStep,
  animationPhase,
  actualCurrentStep,
}: AESVisualizerProps) {
  const [states, setStates] = useState<number[][][]>([]);
  const [roundKeys, setRoundKeys] = useState<number[][][]>([]);
  const [highlightCells, setHighlightCells] = useState<
    { i: number; j: number }[]
  >([]);
  const [showArrows, setShowArrows] = useState<boolean>(false);
  const [arrowType, setArrowType] = useState<string>("");
  const [exportData, setExportData] = useState<string>("");

  // Refs for the elements that need to be connected
  const firstCellRef = useRef<HTMLDivElement | null>(null);
  const secondCellRef = useRef<HTMLDivElement | null>(null);
  const resultBoxRef = useRef<HTMLDivElement | null>(null);

  // The fixed matrix used in AES MixColumns
  const mixMatrix = [
    ["02", "03", "01", "01"],
    ["01", "02", "03", "01"],
    ["01", "01", "02", "03"],
    ["03", "01", "01", "02"]
  ];

  // Define which steps are AddRoundKey operations
  const addRoundKeySteps = [2, 6, 10];

  // State to store arrow path coordinates
  const [arrowPaths, setArrowPaths] = useState({
    firstArrow: "M0,0 Q0,0 0,0",
    secondArrow: "M0,0 Q0,0 0,0"
  });

  const [mixColumnsResult, setMixColumnsResult] = useState<number[][]>([]);
  useEffect(() => {
    console.log("Actual current step:", actualCurrentStep);

    if (actualCurrentStep === 16) {
      //@ts-ignore valid code
      const result = mixColumnsAES(currentState);
      setMixColumnsResult(result);
      console.log("This is mix column result: ", mixColumnsResult);
    }
  }, [actualCurrentStep])

  // Calculate the positions and draw arrows when components are mounted and whenever highlighted cells change
  useEffect(() => {
    const calculateArrowPaths = () => {
      console.log("Calculating arrow paths...");
      if (!firstCellRef.current || !secondCellRef.current || !resultBoxRef.current) return;
      console.log("Calculated!");

      const firstCellRect = firstCellRef.current?.getBoundingClientRect();
      const secondCellRect = secondCellRef.current?.getBoundingClientRect();
      const resultBoxRect = resultBoxRef.current?.getBoundingClientRect();

      // Wrapper rect for relative positioning
      const wrapperRect = document.getElementById('xor-visualizer')?.getBoundingClientRect();

      if (wrapperRect) {
        // Calculate start and end points relative to the wrapper
        const firstStart = {
          x: firstCellRect.right - wrapperRect.left,
          y: firstCellRect.top + firstCellRect.height/2 - wrapperRect.top
        };
        
        const secondStart = {
          x: secondCellRect.right - wrapperRect.left,
          y: secondCellRect.top + secondCellRect.height/2 - wrapperRect.top
        };
        
        const end = {
          x: resultBoxRect.left - wrapperRect.left,
          y: resultBoxRect.top + resultBoxRect.height/2 - wrapperRect.top
        };

        // Create curved paths
        const firstArrow = `M${firstStart.x},${firstStart.y} Q${(firstStart.x + end.x)/2 - 20},${firstStart.y} ${end.x + 3},${end.y - 20}`;
        const secondArrow = `M${secondStart.x},${secondStart.y} Q${(secondStart.x + end.x)/2 + 20},${secondStart.y} ${end.x + 3},${end.y + 20}`;

        setArrowPaths({ firstArrow, secondArrow });
        console.log("Arrow paths calculated:", { firstArrow, secondArrow });
      } else {
        console.log("WrapperReact is undefined/null.");
      }
    };

    console.log("Got here!");

    // Calculate paths after DOM updates
    const timeoutId = setTimeout(calculateArrowPaths, 100);
    
    // Add resize listener
    window.addEventListener('resize', calculateArrowPaths);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateArrowPaths);
    };
  }, [actualCurrentStep]);

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

      console.log("Encrypted states: ", encryptionStates);

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

      if (currentStep === 1) {
        // Initial State
        // Highlight the first column to show column-wise arrangement
        highlights.push(
          { i: 0, j: 0 },
          { i: 1, j: 0 },
          { i: 2, j: 0 },
          { i: 3, j: 0 }
        );
        setArrowType("column");
      } else if (currentStep === 2 || currentStep === 6 || currentStep === 10) {
        // AddRoundKey
        // Highlight a cell to show XOR operation
        highlights.push({ i: 1, j: 1 });
        setArrowType("xor");
      } else if (currentStep === 3 || currentStep === 8) {
        // SubBytes
        // Highlight cells to show substitution
        highlights.push(
          { i: 0, j: 0 },
          { i: 1, j: 0 },
          { i: 2, j: 0 },
          { i: 3, j: 0 }
        );
        setArrowType("substitute");
      } else if (currentStep === 4 || currentStep === 9) {
        // ShiftRows
        // Highlight rows to show shifting
        highlights.push(
          { i: 1, j: 0 },
          { i: 1, j: 1 },
          { i: 1, j: 2 },
          { i: 1, j: 3 }
        );
        setArrowType("shift");
      } else if (currentStep === 5) {
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
      if (currentStep > 0 && currentStep < 12) {
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

  //@ts-ignore
  let currentState;
  const triggerSteps: Record<number, number> = {
    2: 9,
    3: 12,
    4: 15,
    5: 18,
    6: 21,
    7: 24,
    8: 27,
    9: 30,
    10: 33,
  };
  
  if (currentStep === 1) {
    currentState = states[0];
  } else if (currentStep === 11) {
    currentState = states[states.length - 1];
  } else if (
    triggerSteps[currentStep] &&
    actualCurrentStep === triggerSteps[currentStep]
  ) {
    console.log("Trigger step:", currentStep);
    console.log("Actual current step:", actualCurrentStep);
    console.log("States length:", states.length);
    currentState = states[currentStep - 1];
    console.log(currentState);
  } else {
    currentState = states[currentStep - 2];
  }

  // Find the corresponding round key for the current step
  let currentRoundKey: number[][] | undefined;
  if (currentStep === 1) {
    currentRoundKey = roundKeys[0];
  } else if (currentStep === 2) {
    currentRoundKey = roundKeys[0];
  } else if (currentStep === 6) {
    currentRoundKey = roundKeys[1];
  } else if (currentStep === 10) {
    currentRoundKey = roundKeys[10];
  }

  // Map step numbers to operation names
  const getOperationName = (step: number) => {
    if (step === 0) return "Започване на алгоритъма";
    if (step === 1) return "Начално състояние";
    if (step === 2) return "Добавяне на под-ключ (Начално)";
    if (step === 3) return "SubBytes";
    if (step === 4) return "ShiftRows";
    if (step === 5) return "MixColumns";
    if (step === 6) return "Добавяне на под-ключ";
    if (step === 7) return "Повтаряне още 8 пъти";
    if (step === 8) return "Финал - SubBytes";
    if (step === 9) return "Финал - ShiftRows";
    if (step === 10) return "Финал - Добавяне на под-ключ";
    if (step === 11) return "Шифъртекст";
    return "Завършено";
  };

  const currentOperation = getOperationName(currentStep);

  // Color mapping for different operations
  const getOperationColor = (operation: string) => {
    if (operation.includes("Започване на алгоритъма")) return "rgb(155, 193, 255)"; // blue
    if (operation.includes("Начално състояние")) return "rgb(59, 130, 246)"; // blue
    if (operation.includes("Добавяне на под-ключ"))
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
              <MoveLeft className="h-12 w-12 mx-auto text-pink-400" />
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

      <div className="relative" id="xor-visualizer">
        <div className="grid grid-cols-4 gap-2 mb-8">
        {currentStep === 0 ? (
            <div className="col-span-4 flex flex-col items-center justify-center w-full space-y-4">
              {actualCurrentStep === 1 && (
                <>
                  <h1 className="text-white text-2xl font-semibold">Plaintext:</h1>
                  <h1 className="text-white text-4xl">{plaintext}</h1>
                  <h1 className="text-white text-2xl font-semibold">Key:</h1>
                  <h1 className="text-white text-4xl">{encryptionKey}</h1>
                </>
              )}

              {actualCurrentStep === 2 && (
                <>
                  <h1 className="text-white text-2xl font-semibold">Plaintext:</h1>
                  <h1 className="text-white text-4xl">{plaintext}</h1>
                  <h2 className="text-white text-2xl font-semibold">HEX:</h2>
                  <h1 className="text-white text-4xl">
                    {plaintext
                      .split("")
                      .map((char) => char.charCodeAt(0).toString(16).toUpperCase())
                      .join(" ")}
                  </h1>
                </>
              )}

              {actualCurrentStep === 3 && (
                <>
                  <h1 className="text-white text-2xl font-semibold">Key:</h1>
                  <h1 className="text-white text-4xl">{encryptionKey}</h1>
                  <h2 className="text-white text-2xl font-semibold">HEX:</h2>
                  <h1 className="text-white text-4xl">
                    {encryptionKey
                      .split("")
                      .map((char) => char.charCodeAt(0).toString(16).toUpperCase())
                      .join(" ")}
                  </h1>
                </>
              )}
            </div>
          ) : (
            //@ts-ignore undefined on purpose
            currentState.map((row, i) =>
              row.map((value, j) => (
                <motion.div
                  key={`state-${i}-${j}`}
                  ref={i === 1 && j === 1 ? firstCellRef : null}
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
                    <div className="text-xs text-white/70">({i},{j})</div>
                    <div className="font-bold text-white">
                      {value.toString(16).padStart(2, "0").toUpperCase()}
                    </div>
                  </div>
                </motion.div>
              ))
            )
          )}
        </div>

        {renderArrows()}

        {/* Use isAddRoundKeyStep to determine when to show the round key */}
        {isAddRoundKeyStep &&
          animationPhase === 1 &&
          currentRoundKey &&
          currentRoundKey.length > 0 && (
            <div className="w-full max-w-2xl bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-lg font-medium mb-4 text-center text-white">
                Под-ключ
              </h4>
              <div className="grid grid-cols-4 gap-2 justify-center">
                {
                  //@ts-ignore undefined on purpose
                  currentRoundKey.map((row, i) =>
                    row.map((value, j) => (
                      <motion.div
                        key={`key-${i}-${j}`}
                        ref={i === 1 && j === 1 ? secondCellRef : null}
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
                          <div className="text-xs text-white/70">({i},{j})</div>
                          <div className="font-bold text-white">
                            {value.toString(16).padStart(2, "0").toUpperCase()}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )
                }
              </div>

              {/* SVG Overlay for Arrows */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
                <path
                  d={arrowPaths.firstArrow}
                  stroke="#10b981"
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead1)"
                />
                <path
                  d={arrowPaths.secondArrow}
                  stroke="#10b981"
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead2)"
                />
                <defs>
                  <marker
                    id="arrowhead1"
                    markerWidth="10"
                    markerHeight="7"
                    refX="5"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                  </marker>
                  <marker
                    id="arrowhead2"
                    markerWidth="10"
                    markerHeight="7"
                    refX="5"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                  </marker>
                </defs>
              </svg>

              <div 
                ref={resultBoxRef}
                className="absolute left-[16vw] top-[35.1vh] w-16 h-16 border-2 border-emerald-500 rounded-md flex items-center justify-center bg-emerald-500"
              >
                <span className="text-xl font-bold text-white">
                  {(currentState[1][1] ^ currentRoundKey[1][1]).toString(16).padStart(2, "0").toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {actualCurrentStep === 11 || actualCurrentStep === 26 ? (
            // SVG Overlay for Arrow
            <>
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <path d={undefined} fill="none" stroke="black" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                  </marker>
                </defs>
              </svg>

              <div className="grid grid-cols-1 gap-2 justify-center">
                {currentState.map((row, i) => (
                  <div key={`row-${i}`} className="flex flex-row gap-2">
                    {row.map((value, j) => {
                      // Get the value from the currentState
                      const cellValue = value;
                      
                      // Convert the value from binary to HEX
                      const hexValue = cellValue.toString(16).padStart(2, "0").toUpperCase();
                      
                      // Use the AES-128 S-Box to get the substituted value
                      const sBoxValue = aesSBox[cellValue].toString(16).padStart(2, "0").toUpperCase();

                      let bgColor;
                      if (j === 0) {
                        bgColor = "rgb(249, 115, 22)";
                      } else {
                        bgColor = "rgba(75, 85, 99, 0.8)"
                      }
                      
                      return (
                        <motion.div
                          key={`cell-${i}-${j}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                            backgroundColor: bgColor,
                            borderColor: "transparent",
                            borderWidth: "0px",
                          }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="w-16 h-16 flex items-center justify-center rounded-md text-black font-mono relative"
                        >
                          <div className="text-center">
                            <div className="text-xs text-white/70">({i},{j})</div>
                            <div className="font-bold text-white">{j === 0 ? sBoxValue : hexValue}</div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          ) : null}


      {actualCurrentStep === 17 && (
        /* Matrix Multiplication Visualization */
        <div className="flex items-center justify-center mb-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center"
          >
            {/* b matrix with brackets */}
            <div className="flex items-stretch h-44">
              {/* Left bracket */}
              <div className="text-white text-5xl flex flex-col justify-between h-full">
                <div>⎡</div>
                <div>⎢</div>
                <div>⎢</div>
                <div>⎣</div>
              </div>

              {/* b matrix */}
              <div className="flex flex-col justify-around mx-2 gap-3">
                {mixColumnsResult !== undefined && mixColumnsResult.map((row, i) => {
                  return (
                    <motion.div
                    key={`cell-${i}-mix-columns`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      backgroundColor: "rgb(16, 185, 129)",
                      borderColor: "transparent",
                      borderWidth: "0px",
                    }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="w-16 h-16 flex items-center justify-center rounded-md text-black font-mono relative"
                    >
                    <div className="text-center">
                      <div className="font-bold text-white">{row[0].toString(16).padStart(2, "0").toUpperCase()}</div>
                    </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right bracket */}
              <div className="text-white text-5xl flex flex-col justify-between h-full ml-1">
                <div>⎤</div>
                <div>⎥</div>
                <div>⎥</div>
                <div>⎦</div>
              </div>
            </div>

            {/* Equals sign */}
            <div className="text-white text-2xl mx-4">=</div>

            {/* Mix matrix with brackets */}
            <div className="flex items-stretch h-44">
              {/* Left bracket */}
              <div className="text-white text-5xl flex flex-col justify-between h-full">
                <div>⎡</div>
                <div>⎢</div>
                <div>⎢</div>
                <div>⎣</div>
              </div>

              {/* Mix matrix */}
              <div className="flex flex-col justify-around mx-2">
                {mixMatrix.map((row, i) => (
                  <div key={`mix-row-${i}`} className="h-10 flex items-center">
                    {row.map((val, j) => (
                      <div key={`mix-${i}-${j}`} className="w-8 text-center font-mono text-purple-300">
                        {val}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Right bracket */}
              <div className="text-white text-5xl flex flex-col justify-between h-full ml-1">
                <div>⎤</div>
                <div>⎥</div>
                <div>⎥</div>
                <div>⎦</div>
              </div>
            </div>

            {/* Multiplication sign */}
            <div className="text-white text-2xl mx-4">×</div>

            {/* a matrix with brackets */}
            <div className="flex items-stretch h-44">
              {/* Left bracket */}
              <div className="text-white text-5xl flex flex-col justify-between h-full">
                <div>⎡</div>
                <div>⎢</div>
                <div>⎢</div>
                <div>⎣</div>
              </div>

              {/* a matrix */}
              <div className="flex flex-col justify-around mx-2 gap-3">
                {currentState.map((row, i) => (
                  <motion.div
                  key={`cell-${i}-mix-columns`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    backgroundColor: "rgb(139, 92, 246)",
                    borderColor: "transparent",
                    borderWidth: "0px",
                  }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="w-16 h-16 flex items-center justify-center rounded-md text-black font-mono relative"
                  >
                  <div className="text-center">
                    <div className="font-bold text-white">{row[0].toString(16).padStart(2, "0").toUpperCase()}</div>
                  </div>
                  </motion.div>
                ))}
              </div>

              {/* Right bracket */}
              <div className="text-white text-5xl flex flex-col justify-between h-full ml-1">
                <div>⎤</div>
                <div>⎥</div>
                <div>⎥</div>
                <div>⎦</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

        {currentStep === 1 &&
          currentRoundKey &&
          currentRoundKey.length > 0 && (
            <div className="w-full max-w-2xl bg-gray-700/50 rounded-lg p-4">
              <h4 className="text-lg font-medium mb-4 text-center text-white">
                Под-ключ
              </h4>
              <div className="grid grid-cols-4 gap-2 justify-center">
                {
                  //@ts-ignore undefined on purpose
                  currentRoundKey.map((row, i) =>
                    row.map((value, j) => (
                      <motion.div
                        key={`key-${i}-${j}`}
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
                          <div className="text-xs text-white/70">({i},{j})</div>
                          <div className="font-bold text-white">
                            {value.toString(16).padStart(2, "0").toUpperCase()}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )
                }
              </div>
            </div>
        )}
      </div>

      {currentStep === 11 && currentState && (
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
              Експортирайте данните, за да декриптирате използвайки декриптора на началната страница
            </p>
          </div>
        </div>
      )}

<>
      {actualCurrentStep <= 3 ? null : (
        <div className="w-full max-w-2xl bg-gray-700/50 rounded-lg p-4 mt-8">
          <h4 className="text-lg font-medium mb-2">Матрично представяне</h4>
          <div className="font-mono text-sm overflow-x-auto whitespace-pre">
            
            {//@ts-ignore undefined on purpose
            currentState.map((row) => 
              `[ ${row.map((val) => val.toString(16).padStart(2, "0").toUpperCase()).join(" ")} ]\n`
            ).join("")}
          </div>
        </div>
      )}
    </>
    </div>
  );
}
