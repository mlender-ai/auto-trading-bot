import { View, StyleSheet, type ViewProps } from "react-native";
import { Colors, Radius, CardPadding } from "../../constants/theme";

interface Props extends ViewProps {
  noPadding?: boolean;
}

export function Card({ noPadding = false, style, children, ...props }: Props) {
  return (
    <View
      style={[styles.card, noPadding && styles.noPadding, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.ebonyCanvas,
    borderRadius: Radius.cards,
    padding: CardPadding,
  },
  noPadding: {
    padding: 0,
  },
});
