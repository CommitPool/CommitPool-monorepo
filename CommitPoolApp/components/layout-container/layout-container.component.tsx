import React from "react";
import { Center, Flex, Heading, Container, VStack } from "@chakra-ui/react";

interface LayoutContainer {
  children?: React.ReactNode;
}

const LayoutContainer = ({ children }: LayoutContainer) => {
  return (
    <VStack
      backgroundImage="url('https://i.imgur.com/Q1NCXvz.png')"
      backgroundPosition="50% 50%"
      backgroundSize="auto 100%"
      height="100%"
    >
      <Heading size="3xl" m="0.5em" color="rgba(212, 84, 84, 1)">
        CommitPool
      </Heading>
      <Container color="white">
        <Flex flexDir="column" align="center" h="90%" mt="5">
          {children}
        </Flex>
      </Container>
    </VStack>
  );
};

export default LayoutContainer;
