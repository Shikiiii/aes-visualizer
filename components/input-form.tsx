"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Play } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface InputFormProps {
  plaintext: string;
  setPlaintext: (value: string) => void;
  encryptionKey: string;
  setEncryptionKey: (value: string) => void;
  onStart: () => void;
}

export function InputForm({
  plaintext,
  setPlaintext,
  encryptionKey,
  setEncryptionKey,
  onStart,
}: InputFormProps) {
  const [plaintextError, setPlaintextError] = useState("");
  const [keyError, setKeyError] = useState("");

  const validateInputs = () => {
    let isValid = true;

    // Validate plaintext (must be 16 characters for AES-128)
    if (plaintext.length !== 16) {
      setPlaintextError("Плейнтекстът трябва да е точно 16 символа");
      isValid = false;
    } else {
      setPlaintextError("");
    }

    // Validate key (must be 16 characters for AES-128)
    if (encryptionKey.length !== 16) {
      setKeyError("Ключът трябва да е точно 16 символа");
      isValid = false;
    } else {
      setKeyError("");
    }

    return isValid;
  };

  const handleStart = () => {
    if (validateInputs()) {
      onStart();
    }
  };

  const handleUseExample = () => {
    setPlaintext("YELLOWSUBMARINES");
    setEncryptionKey("THISISASECRETKEY");
    setPlaintextError("");
    setKeyError("");
  };

  return (
    <Card className="bg-gray-800/80 border-gray-700">
      <CardHeader>
        <CardTitle className="text-2xl text-emerald-400">
          AES-128 Параметри за криптиране
        </CardTitle>
        <CardDescription>
          Въведете плейнтекстът и ключа, за да започнете визуализацията на
          AES-128.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          <div>
            <label
              htmlFor="plaintext"
              className="block text-sm font-medium mb-2 text-white"
            >
              Plaintext (16 букви)
            </label>
            <Input
              id="plaintext"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="Въведи 16 символен плейнтекст"
              className="bg-gray-700 border-gray-600 text-white"
            />
            {plaintextError && (
              <p className="mt-1 text-red-400 text-sm">{plaintextError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="encryptionKey"
              className="block text-sm font-medium mb-2 text-white"
            >
              Key (16 букви)
            </label>
            <Input
              id="encryptionKey"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              placeholder="Въведи 16 символен ключ"
              className="bg-gray-700 border-gray-600 text-white"
            />
            {keyError && (
              <p className="mt-1 text-red-400 text-sm">{keyError}</p>
            )}
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleStart}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              <Play className="mr-2 h-4 w-4" /> Начало
            </Button>
          </div>

          <Button
            onClick={handleUseExample}
            variant="ghost"
            className="w-full mt-2 text-gray-300 hover:text-gray-800"
          >
            Използване на примерни стойности
          </Button>
        </div>

        <Alert className="mt-8 bg-blue-900/30 border-blue-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-white">Примерни стойности</AlertTitle>
          <AlertDescription className="text-sm text-white">
            <p>
              <strong>Plaintext:</strong> YELLOWSUBMARINES
            </p>
            <p>
              <strong>Key:</strong> THISISASECRETKEY
            </p>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
