import React, { createContext, useContext, useEffect, useState } from "react";
import { Athlete, Commitment } from "../types";

import * as WebBrowser from "expo-web-browser";
import {
  makeRedirectUri,
  useAuthRequest,
  revokeAsync,
  RevokeTokenRequestConfig,
  DiscoveryDocument,
} from "expo-auth-session";
import axios from "axios";
import { useCurrentUser } from "./currentUserContext";
import { useCommitPool } from "./commitPoolContext";
import { useLocalStorage } from "../hooks/useLocalStorage";
import usePlausible from "../hooks/usePlausible";

//Strava Credentials
const clientID: string = "51548&";
const clientSecret: string = "28d56211b9ca33972055bf61010074fbedc3c7c2";

// Strava Endpoints
const discovery: DiscoveryDocument = {
  authorizationEndpoint: "https://www.strava.com/oauth/mobile/authorize",
  tokenEndpoint: "https://www.strava.com/oauth/token",
  revocationEndpoint: "https://www.strava.com/oauth/deauthorize",
};

type StravaContextType = {
  athlete?: Athlete;
  handleStravaLogin: () => void;
};

export const StravaContext = createContext<StravaContextType>({
  athlete: undefined,
  handleStravaLogin: () => {},
});

interface StravaProps {
  children: any;
}

WebBrowser.maybeCompleteAuthSession();

export const StravaContextProvider: React.FC<StravaProps> = ({
  children,
}: StravaProps) => {
  const { trackEvent } = usePlausible();

  const [athlete, setAthlete] = useState<Athlete>();  // Athlete data received from Strava
  const { currentUser, setCurrentUser } = useCurrentUser(); // COmplete user, web3 + Strava
  const { commitment, setCommitment } = useCommitPool(); // Commitment that the user has created. Could be default (commitment.exists === false)
  const [refreshToken, setRefreshToken] = useLocalStorage<string>(
    "strava_rt",
    ""
  );
  const [accessToken, setAccessToken] = useLocalStorage<string>(
    "strava_at",
    ""
  );

  console.log("Athlete in context: ", athlete);

  const handleStravaLogin = async () => {
    athlete?.id ? await logOutAndClearState() : await stravaOauth();
  };

  // Login is handled by Expo, will display Strava login modal
  const stravaOauth = async () => {
    await promptAsync();
  };

  //Strava login
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientID,
      scopes: ["read,activity:read"], // Strava API spec
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        // the "redirect" must match your "Authorization Callback Domain" in the Strava dev console.
        native: "your.app://redirect",
      }),
    },
    discovery
  );

  // Clear all user parameteres
  const logOutAndClearState = async () => {
    if (refreshToken !== "") {
      const config: RevokeTokenRequestConfig = { token: refreshToken };

      await revokeAsync(config, discovery);
    }

    setRefreshToken("");
    setAccessToken("");
    setAthlete(undefined);
  };

  //Go over log in/update options
  useEffect(() => {
    if (refreshToken !== "") {
      refreshAccessToken(refreshToken);
    }

    if (refreshToken !== "" && accessToken !== "") {
      setAthleteUsingAccessToken(accessToken);
    } else if (
      refreshToken === "" &&
      accessToken === "" &&
      response?.type === "success" &&
      response.params?.code
    ) {
      const authCode: string = response.params.code;
      executeLoginAndSetAthleteUsingAuthCode(authCode);
    }
  }, [response, refreshToken, accessToken]);

  //finally post strava user to db 
  useEffect(() => {
    if (athlete && refreshToken !== "") {
      console.log("Posting athlete to DB");
      storeAthleteInDb(athlete, refreshToken);
    }
  }, [athlete, refreshToken]);

  const storeAthleteInDb = async (athlete: Athlete, refresh_token: string) => {
    await axios({
      url: "https://test2.dcl.properties/user",
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      data: {
        address: athlete.id,
        token: refresh_token,
      },
    })
      .then((response) => {
        console.log("Athlete data posted to db: ", response.data);
      })
      .catch((error) => console.log("Error posting athlete to db: ", error));
  };

  const executeLoginAndSetAthleteUsingAuthCode = async (authCode: string) => {
    console.log("Getting athlete data");
    trackEvent('strava_get_athlete_data')


    await axios({
      method: "post",
      baseURL: discovery.tokenEndpoint,
      params: {
        client_id: clientID,
        client_secret: clientSecret,
        code: authCode,
        grant_type: "authorization_code",
      },
    })
      .then(async (response) => {
        const athleteData = response.data.athlete;
        const { refresh_token, access_token } = response.data;
        setAthlete({ ...response.data.athlete });
        setRefreshToken(refresh_token);
        setAccessToken(access_token);

        if (athleteData?.username || athleteData?.firstname) {
          setCurrentUser({
            ...currentUser,
            username: athleteData.username || athleteData.firstname,
          });
        }
      })
      .catch((error) => {
        console.log("Error getting athlete data: ", error);
      });
  };

  const setAthleteUsingAccessToken = async (_accessToken: string) => {
    console.log("Getting athlete data using access token: ", _accessToken);

    await axios({
      baseURL: "https://www.strava.com/api/v3/athlete",
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${_accessToken}`,
      },
    })
      .then(async (response) => {
        console.log("Response from access token flow: ", response);
        const athleteData = response.data;
        setAthlete({ ...response.data });

        if (athleteData?.username || athleteData?.firstname) {
          setCurrentUser({
            ...currentUser,
            username: athleteData.username || athleteData.firstname,
          });
        }
      })
      .catch((error) => {
        console.log("Error getting login data using access token: ", error);
      });
  };

  const refreshAccessToken = async (_refreshToken: string) => {
    console.log("Refreshing access token using refesh token: ", _refreshToken);
    await axios({
      baseURL: discovery.tokenEndpoint,
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        client_id: clientID,
        client_secret: clientSecret,
        refresh_token: _refreshToken,
        grant_type: "refresh_token",
      },
    })
      .then(async (response) => {
        console.log("Auth response from refresh accesstoken flow: ", response);
        if (response.data?.access_token) {
          console.log("Setting access token: ", response.data.access_token);
          setAccessToken(response.data.access_token);
        }
      })
      .catch((error) => {
        console.log("Error getting access token using refresh token: ", error);
      });
  };

  //Check for commitment progress
  useEffect(() => {
    console.log("Checking for commitment progress");
    if (athlete && commitment?.goalValue) {
      if (commitment.goalValue) {
        getAthleteActivityData(commitment, accessToken).then((total) => {
          console.log(
            `total: ${total}, goalValue: ${commitment.goalValue} , progress: ${
              commitment.goalValue
                ? (total / 100 / commitment.goalValue) * 100
                : "undefined"
            }`
          );
          const progress = commitment.goalValue
            ? (total / 100 / commitment.goalValue) * 100
            : 0;

          if (commitment.progress !== progress) {
            setCommitment({ ...commitment, progress });
          }
        });
      }
    }
  }, [athlete, commitment]);

  //TODO axios this up
  // The athlete activity data can be queried from the Strava api so we don't call the external adapter to get the Strava data
  const getAthleteActivityData = async (
    commitment: Partial<Commitment>,
    accessToken: string
  ) => {
    trackEvent('strava_get_activity_data')
    return fetch(
      "https://test2.dcl.properties/activities?startTime=" +
        commitment.startTime +
        "&endTime=" +
        commitment.endTime +
        "&type=" +
        commitment.activityName +
        "&accessToken=" +
        accessToken,
      {
        method: "GET",
        headers: {
          // "Content-Type": "application/json",
          Authorization: "Bearer: " + accessToken,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        return json.total;
      });
  };

  return (
    <StravaContext.Provider value={{ athlete, handleStravaLogin }}>
      {children}
    </StravaContext.Provider>
  );
};

export const useStrava = () => {
  const { athlete, handleStravaLogin } = useContext(StravaContext);
  return { athlete, handleStravaLogin };
};
