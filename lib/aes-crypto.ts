// This file contains the actual AES-128 encryption implementation using Web Crypto API

// Convert a string to an ArrayBuffer
export function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder()
  // @ts-ignore
  return encoder.encode(str).buffer
}

// Convert an ArrayBuffer to a hex string
export function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Convert a hex string to an ArrayBuffer
export function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes.buffer
}

// Convert an ArrayBuffer to a 4x4 matrix (state array)
export function arrayBufferToMatrix(buffer: ArrayBuffer): number[][] {
  const bytes = new Uint8Array(buffer)
  const matrix: number[][] = []

  for (let i = 0; i < 4; i++) {
    const row: number[] = []
    for (let j = 0; j < 4; j++) {
      // AES uses column-major order
      row.push(bytes[i + 4 * j])
    }
    matrix.push(row)
  }

  return matrix
}

// Convert a 4x4 matrix (state array) to an ArrayBuffer
export function matrixToArrayBuffer(matrix: number[][]): ArrayBuffer {
  const bytes = new Uint8Array(16)

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      // AES uses column-major order
      bytes[i + 4 * j] = matrix[i][j]
    }
  }

  return bytes.buffer
}

// Generate a key from a string
export async function generateKey(keyString: string): Promise<CryptoKey> {
  const keyData = stringToArrayBuffer(keyString)

  return await window.crypto.subtle.importKey("raw", keyData, { name: "AES-CBC", length: 128 }, false, [
    "encrypt",
    "decrypt",
  ])
}

// Encrypt a block using AES-128
export async function encryptBlock(
  plaintext: string,
  keyString: string,
): Promise<{
  ciphertext: ArrayBuffer
  key: CryptoKey
  iv: Uint8Array
}> {
  const key = await generateKey(keyString)
  const iv = new Uint8Array(16).fill(0) // Using a zero IV for simplicity

  const plaintextData = stringToArrayBuffer(plaintext)

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    plaintextData,
  )

  return { ciphertext, key, iv }
}

// Decrypt a block using AES-128
export async function decryptBlock(ciphertext: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
  return await window.crypto.subtle.decrypt(
    {
      name: "AES-CBC",
      iv: iv,
    },
    key,
    ciphertext,
  )
}

// Export the key and ciphertext in a format that can be used by external tools
export function exportForExternalTools(ciphertext: ArrayBuffer, iv: Uint8Array): string {
  const ciphertextHex = arrayBufferToHex(ciphertext)
  // @ts-ignore
  const ivHex = arrayBufferToHex(iv.buffer)

  return JSON.stringify({
    ciphertext: ciphertextHex,
    iv: ivHex,
    mode: "AES-CBC",
    padding: "PKCS#7",
  })
}

// The S-box table used in the SubBytes step
export const sBox: number[] = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9,
  0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f,
  0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07,
  0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3,
  0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58,
  0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3,
  0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec, 0x5f,
  0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88,
  0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac,
  0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a,
  0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70,
  0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11,
  0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42,
  0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
]

// The Rcon table used in the key expansion
export const rCon: number[] = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]

// Perform the SubBytes transformation on a state matrix
export function subBytes(state: number[][]): number[][] {
  const newState: number[][] = []

  for (let i = 0; i < 4; i++) {
    const row: number[] = []
    for (let j = 0; j < 4; j++) {
      row.push(sBox[state[i][j]])
    }
    newState.push(row)
  }

  return newState
}

// Perform the ShiftRows transformation on a state matrix
export function shiftRows(state: number[][]): number[][] {
  const newState: number[][] = []

  for (let i = 0; i < 4; i++) {
    const row: number[] = []
    for (let j = 0; j < 4; j++) {
      const shiftedJ = (j + i) % 4
      row.push(state[i][shiftedJ])
    }
    newState.push(row)
  }

  return newState
}

// Helper function for MixColumns
function galoisMultiply(a: number, b: number): number {
  let p = 0
  let hiBitSet

  for (let i = 0; i < 8; i++) {
    if ((b & 1) !== 0) {
      p ^= a
    }

    hiBitSet = (a & 0x80) !== 0
    a <<= 1

    if (hiBitSet) {
      a ^= 0x1b // XOR with the irreducible polynomial x^8 + x^4 + x^3 + x + 1
    }

    b >>= 1
  }

  return p & 0xff
}

// Perform the MixColumns transformation on a state matrix
export function mixColumns(state: number[][]): number[][] {
  const newState: number[][] = []

  for (let j = 0; j < 4; j++) { // For each column
    const column = [
      state[0][j],
      state[1][j],
      state[2][j],
      state[3][j],
    ]

    newState[0] = newState[0] || []
    newState[1] = newState[1] || []
    newState[2] = newState[2] || []
    newState[3] = newState[3] || []

    newState[0][j] = galoisMultiply(column[0], 2) ^ galoisMultiply(column[1], 3) ^ column[2] ^ column[3]
    newState[1][j] = column[0] ^ galoisMultiply(column[1], 2) ^ galoisMultiply(column[2], 3) ^ column[3]
    newState[2][j] = column[0] ^ column[1] ^ galoisMultiply(column[2], 2) ^ galoisMultiply(column[3], 3)
    newState[3][j] = galoisMultiply(column[0], 3) ^ column[1] ^ column[2] ^ galoisMultiply(column[3], 2)
  }

  return newState
}

// Perform the AddRoundKey transformation on a state matrix
export function addRoundKey(state: number[][], roundKey: number[][]): number[][] {
  const newState: number[][] = []

  for (let i = 0; i < 4; i++) {
    const row: number[] = []
    for (let j = 0; j < 4; j++) {
      row.push(state[i][j] ^ roundKey[i][j])
    }
    newState.push(row)
  }

  return newState
}

// Expand the key for all rounds
export function keyExpansion(key: number[][]): number[][][] {
  // Convert the 2D matrix to a flat array for easier key expansion
  const keyBytes = new Uint8Array(16)
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      keyBytes[i + 4 * j] = key[i][j]
    }
  }

  // Expanded key will have 11 round keys (initial + 10 rounds) of 16 bytes each
  const expandedKey = new Uint8Array(11 * 16)

  // Copy the original key to the first 16 bytes
  expandedKey.set(keyBytes, 0)

  // Expand the key
  let rconIndex = 1
  for (let i = 16; i < 11 * 16; i += 4) {
    // Take the last 4 bytes
    const temp = expandedKey.slice(i - 4, i)

    // Every 16 bytes (start of a new round key)
    if (i % 16 === 0) {
      // Rotate left
      const t = temp[0]
      temp[0] = temp[1]
      temp[1] = temp[2]
      temp[2] = temp[3]
      temp[3] = t

      // Apply S-box
      for (let j = 0; j < 4; j++) {
        temp[j] = sBox[temp[j]]
      }

      // XOR with Rcon
      temp[0] ^= rCon[rconIndex++]
    }

    // XOR with bytes 16 positions earlier
    for (let j = 0; j < 4; j++) {
      expandedKey[i + j] = expandedKey[i - 16 + j] ^ temp[j]
    }
  }

  // Convert the expanded key back to our matrix format
  const roundKeys: number[][][] = []
  for (let round = 0; round < 11; round++) {
    const roundKey: number[][] = []
    for (let i = 0; i < 4; i++) {
      const row: number[] = []
      for (let j = 0; j < 4; j++) {
        row.push(expandedKey[round * 16 + i + 4 * j])
      }
      roundKey.push(row)
    }
    roundKeys.push(roundKey)
  }

  return roundKeys
}

// Perform AES-128 encryption on a single block
export function aesEncrypt(
  plaintext: string,
  keyString: string,
): {
  states: number[][][]
  roundKeys: number[][][]
} {
  // Convert plaintext and key to matrices
  const plaintextBuffer = stringToArrayBuffer(plaintext)
  const keyBuffer = stringToArrayBuffer(keyString)

  const state = arrayBufferToMatrix(plaintextBuffer)
  const key = arrayBufferToMatrix(keyBuffer)

  // Expand the key
  const roundKeys = keyExpansion(key)

  // Store all states for visualization
  const states: number[][][] = []

  // Initial state
  states.push([...state.map((row) => [...row])])

  // Initial round - AddRoundKey only
  let currentState = addRoundKey(state, roundKeys[0])
  states.push([...currentState.map((row) => [...row])])

  // Main rounds (1-9)
  for (let round = 1; round <= 9; round++) {
    // SubBytes
    currentState = subBytes(currentState)
    states.push([...currentState.map((row) => [...row])])

    // ShiftRows
    currentState = shiftRows(currentState)
    states.push([...currentState.map((row) => [...row])])

    // MixColumns
    currentState = mixColumns(currentState)
    states.push([...currentState.map((row) => [...row])])

    // AddRoundKey
    currentState = addRoundKey(currentState, roundKeys[round])
    states.push([...currentState.map((row) => [...row])])

    // We only need to show the first round in detail
    if (round === 1) {
      // Add a "repeated" state to indicate that the process repeats
      states.push([...currentState.map((row) => [...row])])

      // Skip to the last round
      if (round < 9) {
        // Apply the remaining rounds without storing intermediate states
        for (let r = round + 1; r <= 9; r++) {
          currentState = subBytes(currentState)
          currentState = shiftRows(currentState)
          currentState = mixColumns(currentState)
          currentState = addRoundKey(currentState, roundKeys[r])
        }
      }
      break
    }
  }

  // Final round (no MixColumns)
  currentState = subBytes(currentState)
  states.push([...currentState.map((row) => [...row])])

  currentState = shiftRows(currentState)
  states.push([...currentState.map((row) => [...row])])

  currentState = addRoundKey(currentState, roundKeys[10])
  states.push([...currentState.map((row) => [...row])])

  // Final ciphertext
  states.push([...currentState.map((row) => [...row])])

  return { states, roundKeys }
}

