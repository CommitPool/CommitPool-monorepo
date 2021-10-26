import Plausible from "plausible-tracker";
// Hook
const usePlausible = () => {
  const plausible = Plausible({
    domain: "app.commitpool.com",
    trackLocalhost: true,
  });

  return plausible;
}

export default usePlausible;
