"use client";

import { useState } from "react";
import { InputForm } from "@/components/input-form";
import { ExplanationPanel } from "@/components/explanation-panel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { AESVisualizer } from "@/components/aes-visualizer";
import { DecryptionBox } from "@/components/decryption-box";

export default function Home() {
  const [plaintext, setPlaintext] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isConfigured, setIsConfigured] = useState(false);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [actualCurrentStep, setActualCurrentStep] = useState<number>(1);

  const totalSteps = 11;
  const actualTotalSteps = 34;

  const handleStart = () => {
    setCurrentStep(0);
    setAnimationPhase(0);
    setIsConfigured(true);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setActualCurrentStep(1);
    setAnimationPhase(0);
    setIsConfigured(false);
  };

  const handleStepForward = () => {
    if (currentStep < totalSteps) {
      if (animationPhase < 2) {
        setAnimationPhase(animationPhase + 1);
        setActualCurrentStep(actualCurrentStep + 1);
      } else {
        setCurrentStep(currentStep + 1);
        setActualCurrentStep(actualCurrentStep + 1);
        setAnimationPhase(0);
      }
    }
  };

  const handleStepBackward = () => {
    if (currentStep > 0 || animationPhase > 0) {
      if (animationPhase > 0) {
        setAnimationPhase(animationPhase - 1);
        setActualCurrentStep(actualCurrentStep - 1);
      } else {
        setCurrentStep(currentStep - 1);
        setActualCurrentStep(actualCurrentStep - 1);
        setAnimationPhase(2);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2">
          AES-128 Визуализация
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Визуализира как алгоритъма за криптиране Advanced Encryption Standard
          (AES-128) работи стъпка по стъпка с подробни обяснения.
        </p>

        {!isConfigured ? (
          <>
            <div className="max-w-2xl mx-auto">
              <InputForm
                plaintext={plaintext}
                setPlaintext={setPlaintext}
                encryptionKey={encryptionKey}
                setEncryptionKey={setEncryptionKey}
                onStart={handleStart}
              />
            </div>

            {/* Add the decryption box */}
            <DecryptionBox />
          </>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-gray-800/80 rounded-xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                {/* Restart Button */}
                <div className="flex justify-center md:justify-start">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 bg-gray-700"
                  >
                    <RotateCcw className="h-4 w-4" /> Рестартиране
                  </Button>
                </div>

                {/* Step Navigation */}
                <div className="flex justify-center md:justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleStepBackward}
                      disabled={currentStep === 0 && animationPhase === 0}
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 bg-gray-700"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <div className="px-4 py-2 bg-gray-700 rounded-md text-center min-w-[180px]">
                      <div className="text-sm text-gray-300">Стъпка</div>
                      <div className="text-xl font-semibold">
                        {actualCurrentStep} от {actualTotalSteps}
                      </div>
                    </div>

                    <Button
                      onClick={handleStepForward}
                      disabled={
                        actualCurrentStep === 34
                      }
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 bg-gray-700"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-sm">
                    <span className="font-medium">Plaintext:</span>{" "}
                    {plaintext || "YELLOWSUBMARINE"}
                  </div>
                  <div className="text-sm ml-4">
                    <span className="font-medium">Key:</span>{" "}
                    {encryptionKey || "THISISASECRETKEY"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <ExplanationPanel
                    currentStep={currentStep}
                    animationPhase={animationPhase}
                  />
                </div>

                <div className="lg:col-span-2">
                  <AESVisualizer
                    plaintext={plaintext || "YELLOWSUBMARINE"}
                    encryptionKey={encryptionKey || "THISISASECRETKEY"}
                    currentStep={currentStep}
                    animationPhase={animationPhase}
                    actualCurrentStep={actualCurrentStep}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <div className="w-full max-w-[80%] overflow-hidden">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-1">
                    {Array.from({ length: totalSteps + 1 }).map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-colors ${
                          index < currentStep
                            ? "bg-emerald-500"
                            : index === currentStep
                            ? "bg-emerald-300"
                            : "bg-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
