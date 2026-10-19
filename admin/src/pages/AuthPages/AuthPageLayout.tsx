import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-[#2171B5] lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-4">
                <img
                  className="h-20 w-auto object-contain brightness-0 invert drop-shadow-md transition-transform duration-300 hover:scale-105"
                  src="/images/logo/osa_logo.png"
                  alt="Happy Life Logo"
                />
              </Link>
              <p className="text-center text-white/90 font-medium tracking-wide">
                Happy Life Admin Dashboard 
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 bottom-6 right-6 block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
