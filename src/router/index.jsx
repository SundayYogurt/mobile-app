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
import Unauthorized from "../pages/Unauthorized.jsx";
import RequireAuth from "../components/RequireAuth.jsx";
import Profile from "../pages/Profile.jsx";
import EditProfile from "../pages/EditProfile.jsx";
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
        element: (
          <RequireAuth Fallback={Unauthorized}>
            <Save />
          </RequireAuth>
        ),
        handle: { title: "บันทึก", backTo: "/" },
      },
      {
        path: "/baby-health",
        element: (
          <RequireAuth Fallback={Unauthorized}>
            <BabyHealth />
          </RequireAuth>
        ),
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
        element: (
          <RequireAuth Fallback={Unauthorized}>
            <Poop />
          </RequireAuth>
        ),
        handle: { title: "Baby Health", backTo: "/baby-health" },
      },
      {
        path: "/urine",
        element: (
          <RequireAuth Fallback={Unauthorized}>
            <Urine />
          </RequireAuth>
        ),
        handle: { title: "Baby Health", backTo: "/baby-health" },
      },
      
      {
        path: "/weight",
        element: (
          <RequireAuth Fallback={Unauthorized}>
            <Weight />
          </RequireAuth>
        ),
        handle: { title: "Baby Health", backTo: "/baby-health" },
      },
      {
        path: "/suckingBreasts",
        element: (
          <RequireAuth Fallback={Unauthorized}>
            <SucklingBreasts />
          </RequireAuth>
        ),
        handle: { title: "Baby Health", backTo: "/baby-health" },
      },
      {
        path: "/unauthorized",
        element: <Unauthorized />,
        handle: { title: "ไม่มีสิทธิ์เข้าถึง", backTo: "/" },
      },
            {
        path: "/profile",
        element: (
          <RequireAuth Fallback={Unauthorized}>
            <Profile />
          </RequireAuth>
        ),
        handle: { title: "Profile", backTo: "/" },
      },
      {
        path: "/unauthorized",
        element: <Unauthorized />,
        handle: { title: "ไม่มีสิทธิ์เข้าถึง", backTo: "/" },
      },
                  {
        path: "/edit-profile/:id",
        element: (
          <RequireAuth Fallback={Unauthorized}>
            <EditProfile />
          </RequireAuth>
        ),
        handle: { title: "Edit Profile", backTo: "/profile" },
      },
      {
        path: "/unauthorized",
        element: <Unauthorized />,
        handle: { title: "ไม่มีสิทธิ์เข้าถึง", backTo: "/" },
      },
    
    ],
  },
]);

export default router;
