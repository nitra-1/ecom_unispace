import React, { useState } from "react";
import { Link } from "react-router-dom";
import AboutUS from "./AboutUS";
import Post from "./Post";
import Setting from "./Setting";

const ToggleBar = () => {
  const [activeToggle, setActiveToggle] = useState("posts");
  return (
    <>
      <div className="col-xl-12">
        <ul className="nav nav-tabs">
          <li className="nav-item" onClick={() => setActiveToggle("posts")}>
            <Link
              // to="#my-posts"
              data-toggle="tab"
              className={`nav-link ${
                activeToggle === "posts" ? "active show" : ""
              }`}
            >
              Posts
            </Link>
          </li>
          <li className="nav-item" onClick={() => setActiveToggle("aboutMe")}>
            <Link
              to="#about-me"
              data-toggle="tab"
              className={`nav-link ${
                activeToggle === "aboutMe" ? "active show" : ""
              }`}
            >
              About Me
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="#profile-settings"
              data-toggle="tab"
              onClick={() => setActiveToggle("setting")}
              className={`nav-link ${
                activeToggle === "setting" ? "active show" : ""
              }`}
            >
              Setting
            </Link>
          </li>
        </ul>
      </div>

      <br></br>

      <div className="col-xl-12">
        <div className="card">
          <div className="card-body">
            <div className="profile-tab">
              <div className="custom-tab-1">
                <div className="tab-content">
                  <div
                    id="my-posts"
                    className={`tab-pane fade ${
                      activeToggle === "posts" ? "active show" : ""
                    }`}
                  >
                    <Post />
                  </div>
                  <div
                    id="about-me"
                    className={`tab-pane fade ${
                      activeToggle === "aboutMe" ? "active show" : ""
                    }`}
                  >
                    <AboutUS />
                  </div>
                  <div
                    id="profile-settings"
                    className={`tab-pane fade ${
                      activeToggle === "setting" ? "active show" : ""
                    }`}
                  >
                    <Setting />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToggleBar;
