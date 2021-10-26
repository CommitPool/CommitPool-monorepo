import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { RootStackParamList } from "..";
import {
  Button,
  ButtonGroup,
  Text,
} from "@chakra-ui/react";

import { LayoutContainer, Footer } from "../../components";
import strings from "../../resources/strings";
import usePlausible from "../../hooks/usePlausible";

type FaqNavigationProps = StackNavigationProp<RootStackParamList, "Faq">;

type FaqPageProps = {
  navigation: FaqNavigationProps;
};

const FaqPage = ({ navigation }: FaqPageProps) => {
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/faq"
  });

  return (
    <LayoutContainer>
      <Text>{strings.faq.strava}</Text>
      <Text>{strings.faq.dai} </Text>
      <Text>{strings.faq.staking}</Text>
      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
        </ButtonGroup>
      </Footer>
    </LayoutContainer>
  );
};

export default FaqPage;
