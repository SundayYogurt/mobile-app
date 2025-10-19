import { createBrowserRouter } from "react-router";

import { MainLayout } from "../layouts/MainLayout.jsx";
import { Home } from "../pages/Home.jsx";
import Knowledge from "../pages/Knowledge.jsx";
import Food from "../pages/Food.jsx";
import { Save } from "../pages/Save.jsx";
import BabyHealth from "../pages/BabyHealth.jsx";
import Contact from "../pages/Contact.jsx";
import FourStep from "../pages/FourStep.jsx";
import { FourPoint } from "../pages/FourPoint.jsx";
import { Posture } from "../pages/Posture.jsx";
import Weight from "../pages/Weight.jsx";
import SucklingBreasts from "../pages/SucklingBreasts.jsx";
import { Poop } from "../pages/Poop.jsx";
import Urine from "../pages/Urine.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
        handle: { title: "MOMSURE แม่อุ่นใจ" },
      },
      {
        path: "/knowledge",
        element: <Knowledge />,
        handle: { title: "ความรู้", backTo: "/" },
      },
      {
        path: "/food",
        element: <Food />,
        handle: { title: "ความรู้", backTo: "/knowledge" },
      },
      {
        path: "/save",
        element: <Save />,
        handle: { title: "บันทึก", backTo: "/" },
      },
      {
        path: "/baby-health",
        element: <BabyHealth />,
        handle: { title: "Baby Health", backTo: "/" },
      },
      {
        path: "/contact",
        element: <Contact />,
        handle: { title: "ติดต่อ", backTo: "/" },
      },
      {
        path: "/four-step",
        element: <FourStep />,
        handle: { title: "ความรู้", backTo: "/knowledge" },
      },
      {
        path: "/four-point",
        element: <FourPoint />,
        handle: { title: "ความรู้", backTo: "/knowledge" },
      },
      {
        path: "/posture",
        element: <Posture />,
        handle: { title: "ความรู้", backTo: "/knowledge" },
      },
      {
        path: "/poop",
        element: <Poop />,
        handle: { title: "Baby Health", backTo: "/baby-health" },
      },
      {
        path: "/urine",
        element: <Urine />,
        handle: { title: "Baby Health", backTo: "/baby-health" },
      },
      {
        path: "/weight",
        element: <Weight />,
        handle: { title: "Baby Health", backTo: "/baby-health" },
      },
      {
        path: "/suckingBreasts",
        element: <SucklingBreasts />,
        handle: { title: "Baby Health", backTo: "/baby-health" },
      },
    ],
  },
]);

export default router;
