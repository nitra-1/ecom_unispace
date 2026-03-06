import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Link } from "react-router-dom";

const Post = () => {
  const [replayModal, setReplayModal] = useState(false);


  return (
    <div>
      <div className="my-post-content pt-3">
        <div className="profile-uoloaded-post border-bottom-1 pb-5">
          {/* <img src={profile08} alt="" className="img-fluid w-100 rounded" /> */}
          <Link className="post-title" to="/post-details">
            <h3 className="text-black">
              Collection of textile samples lay spread
            </h3>
          </Link>
          <p>
            A wonderful serenity has take possession of my entire soul like
            these sweet morning of spare which enjoy whole heart.A wonderful
            serenity has take possession of my entire soul like these sweet
            morning of spare which enjoy whole heart.
          </p>
          <button className="btn btn-primary me-2">
            <span className="me-2">
              {" "}
              <i className="fa fa-heart" />{" "}
            </span>
            Like
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setReplayModal(true)}
          >
            <span className="me-2">
              {" "}
              <i className="fa fa-reply" />
            </span>
            Reply
          </button>
        </div>
        <div className="profile-uoloaded-post border-bottom-1 pb-5">
          {/* <img src={profile09} alt="" className="img-fluid w-100 rounded" /> */}
          <Link className="post-title" to="/post-details">
            <h3 className="text-black">
              Collection of textile samples lay spread
            </h3>
          </Link>
          <p>
            A wonderful serenity has take possession of my entire soul like
            these sweet morning of spare which enjoy whole heart.A wonderful
            serenity has take possession of my entire soul like these sweet
            morning of spare which enjoy whole heart.
          </p>
          <button className="btn btn-primary me-2">
            <span className="me-2">
              {" "}
              <i className="fa fa-heart" />{" "}
            </span>
            Like
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setReplayModal(true)}
          >
            <span className="me-2">
              {" "}
              <i className="fa fa-reply" />
            </span>
            Reply
          </button>
        </div>
        <div className="profile-uoloaded-post pb-3">
          {/* <img src={profile08} alt="" className="img-fluid  w-100 rounded" /> */}
          <Link className="post-title" to="/post-details">
            <h3 className="text-black">
              Collection of textile samples lay spread
            </h3>
          </Link>
          <p>
            A wonderful serenity has take possession of my entire soul like
            these sweet morning of spare which enjoy whole heart.A wonderful
            serenity has take possession of my entire soul like these sweet
            morning of spare which enjoy whole heart.
          </p>
          <button className="btn btn-primary me-2">
            <span className="me-2">
              <i className="fa fa-heart" />
            </span>
            Like
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setReplayModal(true)}
          >
            <span className="me-2">
              {" "}
              <i className="fa fa-reply" />
            </span>
            Reply
          </button>
        </div>
        {/* Modal */}
        <Modal
          show={replayModal}
          onHide={() => setReplayModal(false)}
          className="modal fade"
          id="replyModal"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Post Reply</h5>
              <button
                type="button"
                className="btn-close"
                data-dismiss="modal"
                onClick={() => setReplayModal(false)}
              ></button>
            </div>
            <div className="modal-body">
                <textarea className="form-control" rows="4">
                  Message
                </textarea>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger light"
                data-dismiss="modal"
                onClick={() => setReplayModal(false)}
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Reply
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Post;
