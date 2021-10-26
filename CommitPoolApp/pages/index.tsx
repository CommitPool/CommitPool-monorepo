import LandingPage from "./landing-page/landing-page";
import LoginPage from "./login-page/login-page";
import IntroPage from "./intro-page/intro-page";
import ActivityGoalPage from "./activity-goal-page/activity-goal-page";
import ActivitySourcePage from "./activity-source-page/activity-source-page";
import StakingPage from "./staking-page/staking-page";
import ConfirmationPage from "./confirmation-page/confirmation-page";
import TrackPage from './track-page/track-page';
import CompletionPage from './completion-page/completion-page';
import TestPage from "./landing-page/landing-page";
import FaqPage from './faq-page/faq-page';


export type RootStackParamList = {
  ActivityGoal: undefined;
  ActivitySource: undefined;
  Confirmation: undefined;
  Intro: undefined;
  Landing: undefined;
  Login: undefined;
  Staking: undefined;
  Track: undefined;
  Completion: undefined;
  Test: undefined;
  Faq: undefined;
};

export {
  LandingPage,
  LoginPage,
  IntroPage,
  ActivityGoalPage,
  ActivitySourcePage,
  StakingPage,
  ConfirmationPage,
  TrackPage,
  CompletionPage,
  TestPage,
  FaqPage
};
