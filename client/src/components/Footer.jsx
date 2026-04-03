import React from "react";

const BRAND_LOGO_SRC = "/bharat-logo.png";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand-row">
            <div className="footer-logo-figure">
              <img
                className="footer-brand-logo-img"
                src={BRAND_LOGO_SRC}
                alt=""
                decoding="async"
              />
            </div>
            <div className="brand-text-block footer-brand-titles">
              <div className="brand-title-single">
                <span className="brand-name-accent">Bharat</span>{" "}
                <span className="brand-name-rest">Skill Development Academy</span>
              </div>
            </div>
          </div>
          <p>Computer training, engineering fundamentals, and industry-ready skills.</p>
        </div>
        <div>
          <h5>Popular Tracks</h5>
          <p>Programming, MERN Stack, AI, Cyber Security, Job Preparation</p>
        </div>
        <div>
          <h5>Special Highlight</h5>
          <p>Factory Automation and Robotics</p>
        </div>
      </div>
      <div className="footer-bottom">© 2026 Bharat Skill Development Academy. All rights reserved.</div>
    </footer>
  );
}
