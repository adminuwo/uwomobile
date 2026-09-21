import { TextStyle } from 'react-native';

export const typography = {
  fontSize: {
    xs: 10,
    sm: 11.5,
    base: 13.5,
    lg: 15.5,
    xl: 18,
    '2xl': 22,
    '3xl': 26,
  },

  fontWeight: {
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};
