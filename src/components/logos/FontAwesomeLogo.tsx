import React from 'react';

export const FontAwesomeLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    {...props}
  >
    <title>Font Awesome</title>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="#528dd7" />
    <line x1="4" x2="4" y1="22" y2="15" stroke="#528dd7" strokeWidth="2" />
  </svg>
);