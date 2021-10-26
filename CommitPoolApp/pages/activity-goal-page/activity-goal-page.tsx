import React from "react";
import { StackNavigationProp } from "@react-navigation/stack";

import {
  Button,
  ButtonGroup,
  IconButton,
  Heading,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

import {
  LayoutContainer,
  Footer,
  ProgressBar,
  ActivitySelector,
  DateFromTo,
  DistanceSelector,
} from "../../components";

import strings from "../../resources/strings";

import { RootStackParamList } from "..";
import { useCommitPool } from "../../contexts/commitPoolContext";
import usePlausible from "../../hooks/usePlausible"

type ActivityGoalPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "ActivityGoal"
>;

type ActivityGoalPageProps = {
  navigation: ActivityGoalPageNavigationProps;
};

const ActivityGoalPage = ({ navigation }: ActivityGoalPageProps) => {
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/activity-goal"
  });

  const toast = useToast();
  const { commitment } = useCommitPool();

  const onNext = () => {
    commitment?.activitySet
      ? navigation.navigate("Staking")
      : toast({
          title: "Activity not complete",
          description: "Please check your values and try again",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
  };
  return (
    <LayoutContainer>
      <ProgressBar size={1} />
      <Heading size="md" mt="2em">{strings.activityGoal.setUp.text}</Heading>
      <VStack h="90%" mt="10" align="flex-start" spacing={6}>
        <ActivitySelector text={strings.activityGoal.setUp.activitySelector} />
        <DistanceSelector text={strings.activityGoal.setUp.distanceSelector} />
        <DateFromTo />
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

export default ActivityGoalPage;
