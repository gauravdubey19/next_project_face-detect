import React from "react";

const Navbar = ({ appName }: { appName: string }) => {
  return (
    <>
      <section className="relative w-full h-[5%] overflow-hidden">
        <div className="relative z-50 w-full h-full bg-transparent p-2 px-4 text-xl font-bold">
          {appName}
        </div>
        <div className="absolute top-0 left-0 right-0 z-0 gasblurImg w-full h-full bg-[url('https://i.redd.it/8u3dtryd4br61.gif')] bg-cover bg-no-repeat"></div>
        <svg className="absolute -top-[100%] w-full h-full pointer-events-none">
          <filter id="effect">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </svg>
      </section>
    </>
  );
};

export default Navbar;
