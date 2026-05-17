import { Text as RNText, StyleSheet, type TextProps } from "react-native";
import { Colors, Typography } from "../../constants/theme";

type Variant =
  | "display"
  | "heading-lg"
  | "heading"
  | "subheading"
  | "body"
  | "body-sm"
  | "caption";

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
}

export function Text({ variant = "body", color, style, ...props }: Props) {
  return (
    <RNText
      style={[styles[variant], color ? { color } : undefined, style]}
      {...props}
    />
  );
}

const base = {
  color: Colors.whiteout,
  letterSpacing: Typography.letterSpacing,
  fontWeight: Typography.weight.regular,
} as const;

const styles = StyleSheet.create({
  display: {
    ...base,
    fontSize: Typography.size.display,
    lineHeight: Typography.size.display * Typography.lineHeight.display,
  },
  "heading-lg": {
    ...base,
    fontSize: Typography.size.headingLg,
    lineHeight: Typography.size.headingLg * Typography.lineHeight.headingLg,
    fontWeight: Typography.weight.medium,
  },
  heading: {
    ...base,
    fontSize: Typography.size.heading,
    lineHeight: Typography.size.heading * Typography.lineHeight.heading,
    fontWeight: Typography.weight.medium,
  },
  subheading: {
    ...base,
    fontSize: Typography.size.subheading,
    lineHeight: Typography.size.subheading * Typography.lineHeight.subheading,
  },
  body: {
    ...base,
    fontSize: Typography.size.body,
    lineHeight: Typography.size.body * Typography.lineHeight.body,
  },
  "body-sm": {
    ...base,
    fontSize: Typography.size.bodySm,
    lineHeight: Typography.size.bodySm * Typography.lineHeight.bodySm,
    color: Colors.silverHighlight,
  },
  caption: {
    ...base,
    fontSize: Typography.size.caption,
    lineHeight: Typography.size.caption * Typography.lineHeight.caption,
    color: Colors.midGrayText,
  },
});
