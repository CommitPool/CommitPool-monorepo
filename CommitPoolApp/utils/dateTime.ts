import { DateTime } from "luxon";

const parseSecondTimestampToFullString = (
  timestamp: number | undefined
): string => {
  if (timestamp) {
    return DateTime.fromSeconds(timestamp).toLocaleString({
      weekday: "long",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return "loading";
  }
};

export { parseSecondTimestampToFullString };
