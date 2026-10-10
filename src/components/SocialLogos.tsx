import React from 'react';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

export const YouTubeLogo: React.FC<LogoProps> = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Rect width="48" height="48" rx="12" fill="#FF0000" />
    <Path
      d="M33.2 24.1L19.5 16.2C19.2 16 18.8 16.2 18.8 16.6V32.4C18.8 32.8 19.2 33 19.5 32.8L33.2 24.9C33.5 24.7 33.5 24.3 33.2 24.1Z"
      fill="#FFFFFF"
    />
  </Svg>
);

export const InstagramLogo: React.FC<LogoProps> = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48">
    <Defs>
      <LinearGradient id="igGradMobile" x1="0%" y1="100%" x2="100%" y2="0%">
        <Stop offset="0%" stopColor="#FFD600" />
        <Stop offset="25%" stopColor="#FF7A00" />
        <Stop offset="50%" stopColor="#FF0069" />
        <Stop offset="75%" stopColor="#D300C5" />
        <Stop offset="100%" stopColor="#7638FA" />
      </LinearGradient>
    </Defs>
    <Rect width="48" height="48" rx="12" fill="url(#igGradMobile)" />
    <Rect x="11" y="11" width="26" height="26" rx="7" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Circle cx="24" cy="24" r="6" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <Circle cx="31.5" cy="16.5" r="1.75" fill="#FFFFFF" />
  </Svg>
);

export const XLogo: React.FC<LogoProps> = ({ size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Rect width="24" height="24" rx="6" fill="#000000" />
    <Path
      d="M17.75 4H19.5L13.25 11.25L20.5 20H15.5L11.5 14.75L7 20H5.25L12 12.25L5 4H10.25L13.75 8.75L17.75 4ZM17 18.5H18L8.25 5.5H7.25L17 18.5Z"
      fill="#FFFFFF"
    />
  </Svg>
);
