import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  type TouchableOpacityProps,
} from "react-native";
import { Text } from "./Text";
import { Colors, Radius, Spacing } from "../../constants/theme";

type Variant = "primary" | "secondary" | "ghost" | "pill";

interface Props extends TouchableOpacityProps {
  variant?: Variant;
  label: string;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  label,
  loading = false,
  style,
  disabled,
  ...props
}: Props) {
  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], (disabled || loading) && styles.disabled, style]}
      disabled={disabled || loading}
      activeOpacity={0.75}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={Colors.whiteout} size="small" />
      ) : (
        <Text
          variant="body"
          style={[styles.label, variant === "ghost" && styles.ghostLabel]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.s8,
    paddingHorizontal: Spacing.s16,
    borderRadius: Radius.buttons,
  },
  primary: {
    backgroundColor: Colors.arcaneCta,
    borderWidth: 1,
    borderColor: "rgba(62, 207, 142, 0.3)",
  },
  secondary: {
    backgroundColor: Colors.graphiteBase,
    borderWidth: 1,
    borderColor: Colors.carbonBorder,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  pill: {
    backgroundColor: Colors.ebonyCanvas,
    borderWidth: 1,
    borderColor: Colors.steelSurface,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.s32,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: Colors.whiteout,
    fontWeight: "500",
  },
  ghostLabel: {
    color: Colors.whiteout,
  },
});
