import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <main className="root-container flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bebas-neue text-5xl font-bold text-light-100">
        Whoa, Slow Down There!
      </h1>
      <p className="text-center mt-3 max-w-xl text-light-400">
        You seem to be a bit too enthusiastic with your requests! We've noticed
        that you've been making requests at a rapid pace, and to ensure fair
        access for everyone, we've temporarily limited your request rate. Please
        take a moment to pause before trying again!
      </p>
    </main>
  );
};

export default page;
