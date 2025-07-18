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

// A palette that works well with the gradient background, using low opacity
const colors = [
  'rgba(255, 255, 255, 0.07)',
  'rgba(233, 213, 255, 0.07)',
  'rgba(199, 210, 254, 0.07)',
  'rgba(186, 230, 253, 0.07)',
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
        fontSize: `${Math.floor(Math.random() * 40 + 20)}px`, // 20px to 60px
        color: colors[Math.floor(Math.random() * colors.length)],
        transform: `rotate(${Math.floor(Math.random() * 360)}deg)`,
      },
    });
  }
  return generatedIcons;
};

export const IconBackground = () => {
  const [randomIcons, setRandomIcons] = useState<IconStyle[]>([]);

  useEffect(() => {
    // Generate around 40 icons for a subtle effect
    setRandomIcons(generateRandomIcons(40));
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