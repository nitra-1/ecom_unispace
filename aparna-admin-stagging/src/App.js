import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import AllRoutes from "./AllRoutes.jsx";
import Footer from "./components/Footer.jsx";
import Sidebar from "./components/Sidebar.jsx";

function App() {
  const { user } = useSelector((state) => state);
  const navigate = useNavigate();
  const location = useLocation();
  
  const userInfo = localStorage.getItem('persist:root');

  useEffect(() => {
    if (!user.userToken || !userInfo) {
    if (
        location?.pathname === "/forgot-password" ||
        location?.pathname?.includes("reset")
      ) {
        navigate(
          location?.search
            ? `${location?.pathname}${location?.search}`
            : location?.pathname
        );
      } else {
        // localStorage.clear();
        navigate("/login");
      }
    }
     else {
      if (
        location.pathname === "/login" ||
        location.pathname === "/forgot-password" ||
        location.pathname?.includes("reset") ||
        location.pathname === "/"
      ) {
        navigate("/dashboard");
      }
      // else {
      //   navigate(`${location?.pathname}${location?.hash}${location?.search}`)
      // }
    }
  }, [user.userToken, location.pathname]);

  return (
    <div className="page">
      <div className="page-main">
        {/* <Header /> */}
        {location?.pathname !== "/login" &&
        location?.pathname !== "/forgot-password" &&
        !location?.pathname?.includes("reset") ? (
          <Sidebar />
        ) : (
          <></>
        )}
        <div
          className={
            location?.pathname !== "/login" &&
            location?.pathname !== "/forgot-password" &&
            !location?.pathname?.includes("reset")
              ? "main-content app-content"
              : ""
          }
        >
          <div className="wrraper-app">
            <AllRoutes />
          </div>
        </div>
      </div>
      {location?.pathname !== "/login" &&
        location?.pathname !== "/forgot-password" &&
        !location?.pathname?.includes("reset") && <Footer />}
    </div>
  );
}

export default App;
