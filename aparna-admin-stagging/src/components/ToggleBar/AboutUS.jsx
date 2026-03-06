import React from "react";
import { Link } from "react-router-dom";

const AboutUS = () => {
  return (
    <div>
      <div className="profile-about-me">
        <div className="pt-4 border-bottom-1 pb-3">
          <h4 className="text-primary">About Me</h4>
          <p className="mb-2">
            A wonderful serenity has taken possession of my entire soul, like
            these sweet mornings of spring which I enjoy with my whole heart. I
            am alone, and feel the charm of existence was created for the bliss
            of souls like mine.I am so happy, my dear friend, so absorbed in the
            exquisite sense of mere tranquil existence, that I neglect my
            talents.
          </p>
          <p>
            A collection of textile samples lay spread out on the table - Samsa
            was a travelling salesman - and above it there hung a picture that
            he had recently cut out of an illustrated magazine and housed in a
            nice, gilded frame.
          </p>
        </div>
      </div>
      <div className="profile-skills mb-5">
        <h4 className="text-primary mb-2">Skills</h4>
        <Link
          to="/app-profile"
          className="btn btn-primary light btn-xs mb-1 me-1"
        >
          {" "}
          Admin
        </Link>
        <Link
          to="/app-profile"
          className="btn btn-primary light btn-xs mb-1 me-1"
        >
          {" "}
          Dashboard
        </Link>
        <Link
          to="/app-profile"
          className="btn btn-primary light btn-xs mb-1 me-1"
        >
          Photoshop
        </Link>
        <Link
          to="/app-profile"
          className="btn btn-primary light btn-xs mb-1 me-1"
        >
          Bootstrap
        </Link>
        <Link
          to="/app-profile"
          className="btn btn-primary light btn-xs mb-1 me-1"
        >
          Responsive
        </Link>
        <Link
          to="/app-profile"
          className="btn btn-primary light btn-xs mb-1 me-1"
        >
          Crypto
        </Link>
      </div>
      <div className="profile-lang  mb-5">
        <h4 className="text-primary mb-2">Language</h4>
        <Link to="/app-profile" className="text-muted pe-3 f-s-16">
          <i className="flag-icon flag-icon-us" />
          English
        </Link>
        <Link to="/app-profile" className="text-muted pe-3 f-s-16">
          <i className="flag-icon flag-icon-fr" />
          French
        </Link>
        <Link to="/app-profile" className="text-muted pe-3 f-s-16">
          <i className="flag-icon flag-icon-bd" />
          Bangla
        </Link>
      </div>
      <div className="profile-personal-info">
        <h4 className="text-primary mb-4">Personal Information</h4>
        <div className="row mb-2">
          <div className="col-3">
            <h5 className="f-w-500">
              {" "}
              Name<span className="pull-right">:</span>
            </h5>
          </div>
          <div className="col-9">
            <span>Mitchell C.Shay</span>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-3">
            <h5 className="f-w-500">
              Email<span className="pull-right">:</span>
            </h5>
          </div>
          <div className="col-9">
            <span>example@examplel.com</span>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-3">
            <h5 className="f-w-500">
              {" "}
              Availability<span className="pull-right">:</span>
            </h5>
          </div>
          <div className="col-9">
            <span>Full Time (Free Lancer)</span>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-3">
            <h5 className="f-w-500">
              Age<span className="pull-right">:</span>
            </h5>
          </div>
          <div className="col-9">
            <span>27</span>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-3">
            <h5 className="f-w-500">
              {" "}
              Location<span className="pull-right">:</span>
            </h5>
          </div>
          <div className="col-9">
            <span>Rosemont Avenue Melbourne, Florida</span>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-3">
            <h5 className="f-w-500">
              Year Experience<span className="pull-right">:</span>
            </h5>
          </div>
          <div className="col-9">
            <span>07 Year Experiences</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUS;
