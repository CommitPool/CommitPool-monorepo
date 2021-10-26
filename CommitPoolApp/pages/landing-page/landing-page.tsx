import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { ButtonGroup } from "@chakra-ui/react";
import { RootStackParamList } from "..";
import { LayoutContainer } from "../../components";
import { useCommitPool } from "../../contexts/commitPoolContext";
import {
  Button,
  Heading,
  Text,
  Spacer,
  VStack,
  OrderedList,
  ListItem,
} from "@chakra-ui/react";

import strings from "../../resources/strings";
import usePlausible from "../../hooks/usePlausible";

type LandingPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Test"
>;

type LandingPageProps = {
  navigation: LandingPageNavigationProps;
};

const LandingPage = ({ navigation }: LandingPageProps) => {
  const { setCommitment } = useCommitPool();
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/landing",
  });

  const clearStateAndRoute = () => {
    setCommitment({});
    navigation.navigate("ActivityGoal");
    window.localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
  };
  return (
    <LayoutContainer>
      <Heading>Hold Yourself Accountable</Heading>
      <Spacer mt="5" />
      <VStack h="100%" spacing={6} w="90%">
        <Text fontSize="2xl">{strings.intro.text}</Text>
        <Text>
          It simple! If you complete your goal in time, you get your money back. But if you come up
          short of your goal, you lose your money.
        </Text>
        <Heading size="md">How it works</Heading>

        <OrderedList w="90%" fontSize="1xl" spacing={3}>
          <ListItem>
            Set a short term goal and make a commitment to yourself
          </ListItem>
          <Text fontSize="sm" as="cite">
            "I’m going to bike 50 miles in the next week..""
          </Text>
          <ListItem>
            Stake some money on your ability to keep your commitment
          </ListItem>
          <Text fontSize="sm" as="cite">
            "...and I’m staking $10 on my success"
          </Text>
          <ListItem>Get going!</ListItem>
        </OrderedList>

        <Spacer />
        <ButtonGroup spacing="6">
          <Button onClick={() => navigation.navigate("Login")}>
            {strings.landing.reconnect.button}
          </Button>
          <Button onClick={() => clearStateAndRoute()}>
            {strings.landing.getStarted.text}
          </Button>
        </ButtonGroup>
      </VStack>
    </LayoutContainer>
  );
};

export default LandingPage;
