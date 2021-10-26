import Constants from "expo-constants";


interface EnvironmentProps {
  debug: boolean;
}

const ENV = {
  dev: {
    debug: true,
  },
  prod: {
    debug: false,
  },
};

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.
  if (false) {
    return ENV.dev as EnvironmentProps;
  } else {
    return ENV.prod as EnvironmentProps;
  }
};

export default getEnvVars;
