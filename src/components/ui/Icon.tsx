import React from 'react';

type IconName =
  | 'plus'
  | 'history'
  | 'canvas'
  | 'play'
  | 'stop'
  | 'edit'
  | 'check'
  | 'export'
  | 'image'
  | 'file'
  | 'back';

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const paths: Record<IconName, React.ReactNode> = {
  plus: <path d="M12 5v14M5 12h14" />, 
  history: <><path d="M12 8v4l3 3"/><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M3 12H6"/></>,
  canvas: <><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 9h16"/></>,
  play: <path d="M8 5v14l11-7z"/>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2"/>,
  edit: <><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M14.06 4.94l3.75 3.75"/></>,
  check: <path d="M20 6L9 17l-5-5"/>,
  export: <><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M21 21H3"/></>,
  image: <><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8.5 13.5l2.5-2.5 4.5 4.5"/><circle cx="9" cy="9" r="1.5"/></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>,
  back: <path d="M15 18l-6-6 6-6"/>
};

export const Icon: React.FC<IconProps> = ({ name, size = 20, strokeWidth = 2, className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {paths[name]}
  </svg>
);

export default Icon;
