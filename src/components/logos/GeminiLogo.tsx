import React from 'react';

export const GeminiLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Google Gemini</title>
    <defs>
      <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4F70FF" />
        <stop offset="100%" stopColor="#AD88FF" />
      </linearGradient>
    </defs>
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#geminiGradient)" />
    <path d="M12 6L13.25 9.75L17 11L13.25 12.25L12 16L10.75 12.25L7 11L10.75 9.75L12 6Z" fill="url(#geminiGradient)" />
  </svg>
);