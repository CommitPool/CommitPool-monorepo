const strings = {
  footer: {
    back: "Back",
    help: "?",
    next: "Continue",
    restart: "Restart",
    start: "Get started",
  },
  activityGoal: {
    alert:
      "Ooops! There is something wrong with your commitment :( please check values",
    setUp: {
      text: "Set up your commitment",
      activitySelector: "Select an activity",
      distanceSelector: "Set your distance goal",
      startDate: "Start date",
      endDate: "End date",
    },
    help: "Define the activity and measurement of success you are committing to. Don't worry, you can always change some values before comfirming.",
  },
  activitySource: {
    alert: "Mmmmm... It appears you are not yet connected to Strava",
    loggedIn: {
      text: "Hello",
      button: "Log out",
    },
    notLoggedIn: {
      text: "Connect a data source",
      button: "Connect to Strava",
    },
  },
  completion: {
    success: "Congrats!",
    fail: "Try again...",
  },
  confirmation: {
    alert: "Something is wrong with your commitment, please check values",
    commitment: {
      text: "You set up the following commitment",
      activity: "You're going to",
      distance: "for",
      startDate: "starting",
      endDate: "and completing before",
      stake: "And you're staking the following amount",
    },
  },
  faq: {
    strava: "We use Strava to get...",
    dai: "DAI is a decentralized stablecoin that we use to..",
    staking: "When you commit DAI to an activity measured via Strava..",
  },
  landing: {
    intro: "Welcome to CommitPool",
    new: {
      button: "Get started",
    },
    reconnect: {
      button: "Connect wallet",
    },
    loggedIn: {
      button: "Continue!",
    },
    getStarted: {
      text: "Get Started",
      button: "Get Started",
    },
  },
  login: {
    alert: "Mmmmm... It appears you are not yet connected to a wallet",
    select: {
      torus: "Login using Torus",
      metamask: "Connect MetaMask",
    },
  },
  intro: {
    text: `You have personal goals, but sticking to them is hard. CommitPool is here to help.
    `,
  },
  staking: {
    alert: "Wut?! It appears you're not staking anything?",
    text: "How much do you want to stake?",
    body1: `Staking money on your commitment will give you an extra push if later you don’t feel like putting in the work`,
    textHigh: (amount) => {
      `You're staking ${amount} DAI. That's a big commitment!`;
    },
  },
  track: {
    alert: "Commitment not yet complete, keep it up!",
    tracking: {
      text: "Your commitment",
      activity: "You intend to",
      distance: "for",
      startDate: "from",
      stake: "And staked",
    },
  },
};

export default strings;
