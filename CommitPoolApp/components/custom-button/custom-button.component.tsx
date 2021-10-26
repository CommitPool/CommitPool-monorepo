import React, { useRef } from "react";
import {
  StyleSheet,
  Text,
  Platform,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";
import { Button } from "@chakra-ui/react";
import { useHover } from "@react-native-aria/interactions";

interface CustomButtonProps {
  text: string;
  onPress: () => any;
  style?: StyleProp<ViewStyle>;
}

const CustomButton = ({ text, onPress, style }: CustomButtonProps) => {
  // const ref = useRef(null);
  // const { isHovered, hoverProps } = useHover({}, ref);
  // <Pressable
  //   ref={ref}
  //   onPress={onPress}
  //   style={[styles.button, isHovered && styles.hovered, style]}
  // >
  //   <Text style={styles.text}>{text}</Text>
  // </Pressable>a
  const _text = text.trim();
  return <Button onClick={onPress}>{_text}</Button>;
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    cursor: "pointer",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    width: 250,
    maxWidth: 300,
    maxHeight: "3em",
    backgroundColor: "rgba(212, 84, 84, 1)",
    margin: 10,
    padding: 10,
    borderRadius: 12,
  },
  text: {
    color: "white",
    fontFamily: "OpenSans_400Regular",
  },
  hovered: {
    backgroundColor: "#C43131",
    ...Platform.select({
      ios: {
        shadowColor: "rgba(0,0,0, .7)",
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 1,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
      default: {
        boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
      },
    }),
  },
});

export default CustomButton;
