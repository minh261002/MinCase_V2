import { Suspense } from "react";
import ThankYou from "./thanh-you";

const Page = () => {
  return (
    <Suspense>
      <ThankYou />
    </Suspense>
  );
};

export default Page;
