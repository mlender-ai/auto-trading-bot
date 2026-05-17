import { useState } from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps,
} from "react-native";
import { Colors, Typography, Radius, Spacing } from "../../constants/theme";

export function TextInput({ style, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <RNTextInput
      style={[styles.input, focused && styles.focused, style]}
      placeholderTextColor={Colors.midGrayText}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "rgba(250, 250, 250, 0.027)",
    color: Colors.whiteout,
    borderWidth: 1,
    borderColor: Colors.carbonBorder,
    borderRadius: Radius.inputs,
    paddingVertical: Spacing.s8,
    paddingHorizontal: Spacing.s16,
    fontSize: Typography.size.body,
    lineHeight: Typography.size.body * Typography.lineHeight.body,
    letterSpacing: Typography.letterSpacing,
  },
  focused: {
    borderColor: Colors.taroEssence,
  },
});
