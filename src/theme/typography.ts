import { TextStyle } from 'react-native';

export const typography = {
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
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
