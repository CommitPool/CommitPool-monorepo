import React from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  Button,
  ButtonGroup,
  Center,
  Heading,
  IconButton,
  Image,
  Link,
  Text,
  useToast,
  VStack,
  Spacer,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";

import { LayoutContainer, Footer, ProgressBar } from "../../components";
import { RootStackParamList } from "..";

import strings from "../../resources/strings";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useStrava } from "../../contexts/stravaContext";
import { useCurrentUser } from "../../contexts/currentUserContext";
import usePlausible from "../../hooks/usePlausible";

type ActivitySourcePageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "ActivitySource"
>;

type ActivitySourcePageProps = {
  navigation: ActivitySourcePageNavigationProps;
};

const ActivitySourcePage = ({ navigation }: ActivitySourcePageProps) => {
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/activity-source"
  });

  const toast = useToast();
  const { athlete, handleStravaLogin } = useStrava();
  const { commitment } = useCommitPool();
  const { currentUser } = useCurrentUser();

  const stravaUrl: string = athlete?.id
    ? `http://www.strava.com/athletes/${athlete.id}`
    : ``;

  const onNext = () => {
    {
      if (
        commitment?.exists &&
        athlete?.id &&
        currentUser.attributes?.["custom:account_address"]
      ) {
        navigation.navigate("Track");
      } else if (
        athlete?.id &&
        currentUser.attributes?.["custom:account_address"]
      ) {
        navigation.navigate("Confirmation");
      } else if (
        athlete?.id &&
        !currentUser.attributes?.["custom:account_address"]
      ) {
        navigation.navigate("Login");
      } else {
        toast({
          title: "No source",
          description: "It appears you haven't connected your Strava account",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    }
  };

  return (
    <LayoutContainer>
      <ProgressBar size={3} />
      <Center dir="vertical" h="100%">
        {athlete?.id && athlete?.profile_medium ? (
          <VStack spacing={6} h="80%">
            <Heading size="md">{`${strings.activitySource.loggedIn.text} ${athlete?.firstname}`}</Heading>
            <Image
              borderRadius="full"
              boxSize="150px"
              src={athlete.profile_medium}
            />
            <Spacer />
            <Button onClick={() => handleStravaLogin()}>
              {strings.activitySource.loggedIn.button}
            </Button>
            <Link href={stravaUrl} isExternal target="_blank">
              Open Strava Profile <ExternalLinkIcon mx="2px" />
            </Link>
          </VStack>
        ) : (
          <VStack spacing={6}>
            <Text>{strings.activitySource.notLoggedIn.text}</Text>
            <Button onClick={() => handleStravaLogin()}>
              {strings.activitySource.notLoggedIn.button}
            </Button>
          </VStack>
        )}
      </Center>
      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={() => onNext()}>{strings.footer.next} </Button>
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

export default ActivitySourcePage;
