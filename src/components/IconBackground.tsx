import React, { useState, useEffect, useMemo } from 'react';
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

const colors = [
  'rgba(168, 85, 247, 0.2)',
  'rgba(244, 114, 182, 0.2)',
  'rgba(59, 130, 246, 0.2)',
  'rgba(34, 211, 238, 0.2)',
  'rgba(236, 72, 153, 0.2)',
  'rgba(139, 92, 246, 0.2)',
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
        fontSize: `${Math.floor(Math.random() * 100 + 50)}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
        transform: `rotate(${Math.floor(Math.random() * 360)}deg)`,
        transition: 'filter 0.5s ease-in-out, color 0.5s ease-in-out',
      },
    });
  }
  return generatedIcons;
};

interface IconBackgroundProps {
  maxWidth: number;
  maxHeight: number;
  isGrayscale: boolean;
}

export const IconBackground = ({ maxWidth, maxHeight, isGrayscale }: IconBackgroundProps) => {
  const [randomIcons, setRandomIcons] = useState<IconStyle[]>([]);
  const filterId = "pixelate-filter-advanced";

  const pixelationAmount = useMemo(() => {
    if (maxWidth === 0 || maxHeight === 0) {
      return { width: 0, height: 0 };
    }
    const width = 3600 / maxWidth;
    const height = 6400 / maxHeight;
    return { width, height };
  }, [maxWidth, maxHeight]);

  useEffect(() => {
    setRandomIcons(generateRandomIcons(50));
  }, []);

  const { width: pixelWidth, height: pixelHeight } = pixelationAmount;
  const shouldUsePixelateFilter = pixelWidth > 0 && pixelHeight > 0;

  const filterValue = [
    isGrayscale ? 'grayscale(1)' : '',
    shouldUsePixelateFilter ? `url(#${filterId})` : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          {shouldUsePixelateFilter && (
            <filter id={filterId}>
              <feFlood x={pixelWidth / 2} y={pixelHeight / 2} height="1" width="1" />
              <feComposite width={pixelWidth} height={pixelHeight} />
              <feTile result="a" />
              <feComposite in="SourceGraphic" in2="a" operator="in" />
              <feMorphology operator="dilate" radius={`${pixelWidth / 2} ${pixelHeight / 2}`} />
            </filter>
          )}
        </defs>
      </svg>
      {randomIcons.map((item, index) => (
        <FontAwesomeIcon
          key={index}
          icon={item.icon}
          style={{
            ...item.style,
            filter: filterValue || 'none',
          }}
        />
      ))}
    </div>
  );
};