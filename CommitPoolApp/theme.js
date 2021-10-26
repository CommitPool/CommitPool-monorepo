import { extendTheme } from "@chakra-ui/react";

const config = {
  colors: {
    primary: {
      50: "#ece9ff",
      100: "#c6bef5",
      200: "#a394eb",
      300: "#836ae2",
      400: "#653fd8",
      500: "#5027bf",
      600: "#421d95",
      700: "#29156c",
      800: "#140c42",
      900: "#06021b",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
        borderRadius: "12",
        backgroundColor: "rgba(212, 84, 84, 1)",
        borderWidth: "0",
      },
      sizes: {
        sm: {
          fontSize: "sm",
          px: 3,
          py: 2,
        },
        md: {
          fontSize: "md",
          px: 5,
          py: 3,
        },
      },
      variants: {
        primary: {
          color: "white",
          border: "2px solid rgba(212, 84, 84, 1)",
        },
        secondary: {
          color: "#96BFE5",
          backgroundColor: "#120046",
        },
      },
      defaultProps: {
        size: "md",
        variant: "primary",
      },
    },
    Container: {
      baseStyle: {
        width: "764px",
        height: "696px",
        backgroundColor: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(27px)",
        borderRadius: 10,
        top: 165,
      },
    },
  },
  fonts: {
    heading: "Rubik_700Bold",
    body: "OpenSans_400Regular",
  },
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme(config);
export default theme;
