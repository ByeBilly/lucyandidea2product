/**
 * Lucy Feature - Audio Utilities
 * PCM to WAV conversion for Gemini TTS output
 */

/**
 * Convert base64 PCM audio data to a WAV file URL
 * Gemini's TTS returns raw PCM, which browsers can't play directly
 * 
 * @param base64Pcm - Base64 encoded PCM audio data
 * @param sampleRate - Audio sample rate (default 24000 for Gemini)
 * @returns Blob URL that can be used in an <audio> element
 */
export const pcmToWav = (base64Pcm: string, sampleRate = 24000): string => {
  // Decode base64 to binary
  const binaryString = atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create WAV header (44 bytes)
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  // RIFF chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF" in ASCII
  view.setUint32(4, 36 + len, true); // File size minus 8 bytes
  view.setUint32(8, 0x57415645, false); // "WAVE" in ASCII

  // fmt sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt " in ASCII
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  view.setUint32(36, 0x64617461, false); // "data" in ASCII
  view.setUint32(40, len, true); // Subchunk2Size (audio data size)

  // Combine header and audio data
  const blob = new Blob([view, bytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

/**
 * Clean up a blob URL when no longer needed
 * Call this when the audio is done playing or component unmounts
 * 
 * @param url - The blob URL to revoke
 */
export const revokeAudioUrl = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

/**
 * Check if a MIME type is a supported audio format
 */
export const isSupportedAudioFormat = (mimeType: string): boolean => {
  const supportedFormats = [
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/m4a',
  ];
  return supportedFormats.includes(mimeType.toLowerCase());
};

/**
 * Get file extension from MIME type
 */
export const getAudioExtension = (mimeType: string): string => {
  const mimeToExt: Record<string, string> = {
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/x-wav': 'wav',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/webm': 'webm',
    'audio/aac': 'aac',
    'audio/m4a': 'm4a',
  };
  return mimeToExt[mimeType.toLowerCase()] || 'wav';
};





