import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Search, X } from 'lucide-react-native';

interface SearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  onChangeText,
  placeholder = 'Search...',
  onClear,
  style,
}) => {
  const { colors, radius, spacing } = useTheme();
  const [text, setText] = useState(value);

  const handleChange = (newText: string) => {
    setText(newText);
    if (onChangeText) onChangeText(newText);
  };

  const handleClear = () => {
    setText('');
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.inputBg,
          borderColor: colors.borderMuted,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
    >
      <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
      <TextInput
        value={text}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, { color: colors.textPrimary }]}
      />
      {text.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <X size={16} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 6,
  },
});
