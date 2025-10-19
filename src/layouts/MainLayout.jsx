import React from "react";
import { Outlet } from "react-router";
import {Navbar} from "../components/Navbar";
import {Footer} from "../components/Footer";
export const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen m-0 p-0">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <main className="flex-grow mt-16 pb-[calc(env(safe-area-inset-bottom)+64px)]">
        <Outlet />
      </main>
      <Footer />
    </div>
    
  );
};
