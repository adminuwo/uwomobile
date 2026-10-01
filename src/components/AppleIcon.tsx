import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * Apple Logo Icon — Based on Apple's official SF Symbols glyph path.
 * Used for "Sign in with Apple" button per Apple Human Interface Guidelines.
 * Reference: https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple
 */
interface AppleIconProps {
  size?: number;
  color?: string;
}

export function AppleIcon({ size = 20, color = '#000000' }: AppleIconProps) {
  return (
    <Svg viewBox="0 0 814 1000" width={size} height={size} fill={color}>
      <Path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-47.4-155.5-127.4C46 790.8 0 663 0 541.8c0-207.8 135.4-318 269-318 69.4 0 126.9 45.3 170.8 45.3 42 0 109.2-47.4 185.6-47.4 29.8 0 108.2 2.6 168.5 80.1zm-84.7-217.5c39.5-46.8 67.8-112.5 67.8-178.2 0-9-1-18.1-2.6-25.8-64.3 2.6-140.7 43.4-186.5 93.6-36.5 40.8-70.3 106.5-70.3 173.1 0 10.3 1.9 20.6 2.6 23.9 3.9.6 10.3 1.3 16.6 1.3 57.8 0 129.8-38.8 172.4-87.9z" />
    </Svg>
  );
}
