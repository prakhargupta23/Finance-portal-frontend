/** @format */

import { createBrowserRouter } from "react-router-dom";

import LoginPage from "../Pages/LoginPage";
import PrivateRoute from "./PrivateRoute";
import Finance from "../Pages/Finance";
import DocumentUpload from "../Pages/DocumentUpload";
import Vetting from "../Pages/Vetting";
import VettingDelayPage from "../Pages/VettingDelayPage";

export const routes = createBrowserRouter([
  // {
  //   path: "/Expenditure",
  //   element: (
  //     <PrivateRoute>
  //       <Expenditure />
  //     </PrivateRoute>
  //   ),
  // },
  {
    path: "/*",
    element: <Finance />,
  },
  {
    path: "/Upload",
    element: <DocumentUpload />,
  },
  {
    path: "/vetting",
    element: <Vetting />,
  },
  {
    path: "/vetting/delay",
    element: <VettingDelayPage />,
  },
  // {
  //   path: "/pfa",
  //   element: (
  //     <PrivateRoute>
  //       <PFAPage />
  //     </PrivateRoute>
  //   ),
  // },
]);
