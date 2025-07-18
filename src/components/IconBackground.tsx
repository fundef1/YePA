import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook, faFile, faCog, faImage, faDownload, faUpload,
  faFileArchive, faMagic, faSync, faCheck, faFilePdf, faFileWord,
  faFileImage, faFileCode, faFileExport, faFileImport
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const icons: IconDefinition[] = [
  faBook, faFile, faCog, faImage, faDownload, faUpload,
  faFileArchive, faMagic, faSync, faCheck, faFilePdf, faFileWord,
  faFileImage, faFileCode, faFileExport, faFileImport
];

// A more vibrant and visible color palette with increased opacity
const colors = [
  'rgba(168, 85, 247, 0.2)',   // Vibrant Purple
  'rgba(244, 114, 182, 0.2)',  // Vibrant Pink
  'rgba(59, 130, 246, 0.2)',   // Vibrant Blue
  'rgba(34, 211, 238, 0.2)',   // Vibrant Cyan
  'rgba(236, 72, 153, 0.2)',   // Another Pink
  'rgba(139, 92, 246, 0.2)',   // Another Purple
];

interface IconStyle {
  icon: IconDefinition;
  style: React.CSSProperties;
}

const generateRandomIcons = (count: number): IconStyle[] => {
  const generatedIcons: IconStyle[] = [];
  for (let i = 0; i < count; i++) {
    generatedIcons.push({
      icon: icons[Math.floor(Math.random() * icons.length)],
      style: {
        position: 'absolute',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        fontSize: `${Math.floor(Math.random() * 50 + 25)}px`, // 25px to 75px
        color: colors[Math.floor(Math.random() * colors.length)],
        transform: `rotate(${Math.floor(Math.random() * 360)}deg)`,
        transition: 'color 0.5s ease-in-out',
      },
    });
  }
  return generatedIcons;
};

export const IconBackground = () => {
  const [randomIcons, setRandomIcons] = useState<IconStyle[]>([]);

  useEffect(() => {
    // Generate 50 icons for a denser, more visible effect
    setRandomIcons(generateRandomIcons(50));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {randomIcons.map((item, index) => (
        <FontAwesomeIcon
          key={index}
          icon={item.icon}
          style={item.style}
        />
      ))}
    </div>
  );
};