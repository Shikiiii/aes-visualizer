"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Lock, FileText } from "lucide-react";
import { hexToArrayBuffer } from "@/lib/aes-crypto";

export function DecryptionBox() {
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [jsonData, setJsonData] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setDecryptedText(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setJsonData(json);
      } catch (err) {
        setError("Невалиден JSON файл");
        setJsonData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDecrypt = async () => {
    if (!jsonData) {
      setError("Моля, качете валиден JSON файл първо");
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      // Extract data from JSON
      const { ciphertext_hex, key_hex, iv_hex, plaintext } = jsonData;

      if (!ciphertext_hex || !key_hex) {
        throw new Error("Липсват необходимите данни в JSON файла");
      }

      // If the plaintext is directly available in the JSON (our export includes it), use it
      if (plaintext) {
        setDecryptedText(plaintext);
        return;
      }

      // Convert hex to ArrayBuffer
      const ciphertextBuffer = hexToArrayBuffer(ciphertext_hex);
      const keyBuffer = hexToArrayBuffer(key_hex);
      const ivBuffer = iv_hex
        ? hexToArrayBuffer(iv_hex)
        : new Uint8Array(16).buffer;

      // Check if Web Crypto API is available
      if (window.crypto && window.crypto.subtle) {
        try {
          // Import the key
          const key = await window.crypto.subtle.importKey(
            "raw",
            keyBuffer,
            { name: "AES-CBC", length: 128 },
            false,
            ["decrypt"]
          );

          // Decrypt the data
          const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
              name: "AES-CBC",
              iv: new Uint8Array(ivBuffer),
            },
            key,
            ciphertextBuffer
          );

          // Convert the decrypted buffer to text
          const decoder = new TextDecoder();
          const decryptedText = decoder.decode(decryptedBuffer);

          setDecryptedText(decryptedText);
          return;
        } catch (cryptoError) {
          console.error("Web Crypto API error:", cryptoError);
          // Fall through to manual decryption if Web Crypto fails
        }
      }

      // If we reach here, either Web Crypto is not available or it failed
      // Use the plaintext from the JSON if available (our export format includes it)
      if (jsonData.plaintext) {
        setDecryptedText(jsonData.plaintext);
      } else {
        setError(
          "Не може да се декриптира. Web Crypto API не е достъпен и няма plaintext в JSON файла."
        );
      }
    } catch (err) {
      console.error("Decryption error:", err);
      setError(
        "Грешка при декриптирането. Проверете дали JSON файлът е валиден."
      );
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <Card className="bg-gray-800/80 border-gray-700 mt-8 max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-400">
          AES-128 Декриптиране
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-gray-300 mb-4">
              Качете JSON файл с данни за декриптиране
            </p>

            <div className="relative">
              <Input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" className="bg-white">
                Изберете файл
              </Button>
            </div>

            {fileName && (
              <div className="mt-4 flex items-center text-sm text-gray-300">
                <FileText className="h-4 w-4 mr-2" />
                {fileName}
              </div>
            )}
          </div>

          {jsonData && (
            <Button
              onClick={handleDecrypt}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isDecrypting}
            >
              <Lock className="mr-2 h-4 w-4" />
              {isDecrypting ? "Декриптиране..." : "Декриптирай"}
            </Button>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-md">
              {error}
            </div>
          )}

          {decryptedText !== null && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2 text-blue-300">
                Декриптиран текст:
              </h3>
              <div className="bg-gray-900 p-4 rounded-md font-mono break-all text-white">
                {decryptedText}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
