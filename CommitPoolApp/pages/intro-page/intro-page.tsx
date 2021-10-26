import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { RootStackParamList } from "..";
import { Text, Button, IconButton, ButtonGroup } from "@chakra-ui/react";
import { QuestionIcon } from "@chakra-ui/icons";

import { LayoutContainer } from "../../components";
import strings from "../../resources/strings";
import usePlausible from "../../hooks/usePlausible";

type IntroPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Intro"
>;

type IntroPageProps = {
  navigation: IntroPageNavigationProps;
};

const IntroPage = ({ navigation }: IntroPageProps) => {
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/intro"
  });
  return (
    <LayoutContainer>
      <Text>{strings.intro.text}</Text>
      <ButtonGroup>
        <Button onClick={() => navigation.goBack()}>
          {strings.footer.back}
        </Button>{" "}
        <Button onClick={() => navigation.navigate("ActivityGoal")}>
          {strings.footer.start}
        </Button>
        <IconButton
          aria-label="Go to FAQ"
          icon={<QuestionIcon />}
          onClick={() => navigation.navigate("Faq")}
        />
      </ButtonGroup>
    </LayoutContainer>
  );
};

export default IntroPage;
