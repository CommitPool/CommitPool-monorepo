import React from "react";
import {
  Text,
  Button,
  ButtonGroup,
  Divider,
  Heading,
  IconButton,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

import {
  LayoutContainer,
  Footer,
  ProgressBar,
  StakeBox,
} from "../../components";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "..";

import strings from "../../resources/strings";
import { useCommitPool } from "../../contexts/commitPoolContext";
import usePlausible from "../../hooks/usePlausible";


type StakingPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Staking"
>;

type StakingPageProps = {
  navigation: StakingPageNavigationProps;
};

const StakingPage = ({ navigation }: StakingPageProps) => {
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/staking"
  });
  const toast = useToast();
  const { commitment } = useCommitPool();

  const onNext = () => {
    commitment?.stakeSet
      ? navigation.navigate("ActivitySource")
      : toast({
          title: "Stake not set",
          description: "It appears you have no connected wallet",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
  };

  return (
    <LayoutContainer>
      <ProgressBar size={2} />
      <Heading size="md" m="2em">
        {strings.staking.text}
      </Heading>

      <VStack h="90%">
        <Text>{strings.staking.body1}</Text>
        <Text>{`The more you stake, the bigger the push you’ll give yourself, but the more money you might lose if you don’t meet your commitment to ${commitment?.activityName?.toLowerCase()} ${commitment?.goalValue?.toFixed(2)} miles by next week`}</Text>
        <Divider mt="3em" mb="3em"/>
        <StakeBox />
      </VStack>

      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={() => onNext()}>{strings.footer.next}</Button>
          <IconButton
            aria-label="Go to FAQ"
            icon={<QuestionIcon />}
            onClick={() => navigation.navigate("Faq")}
          />
        </ButtonGroup>
      </Footer>
    </LayoutContainer>
  );
};

export default StakingPage;
