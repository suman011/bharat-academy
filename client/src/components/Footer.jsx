import React from "react";
import { Link } from "react-router-dom";
import { getFooterSocialLinks } from "../config/socialLinks";

const BRAND_LOGO_SRC = "/bharat-logo.png";

export default function Footer() {
  const socialLinks = getFooterSocialLinks();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-col footer-col--main">
          <div className="footer-brand-row">
            <div className="footer-logo-figure">
              <img
                className="footer-brand-logo-img"
                src={BRAND_LOGO_SRC}
                alt="Bharat Skill Development Academy"
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
          <div className="footer-highlight">
            <h5>Special Highlight</h5>
            <p>Factory Automation and Robotics</p>
          </div>
        </div>

        <div className="footer-col footer-col--aside">
          <div className="footer-tracks-social">
            <div className="footer-tracks-block">
              <h5>Popular Tracks</h5>
              <p>Programming, MERN Stack, AI, Cyber Security, Job Preparation</p>
            </div>
            <ul className="footer-social-row" role="list" aria-label="Social media">
              {socialLinks.map(({ id, label, href, Icon }) => {
                const external = /^https?:\/\//i.test(href);
                const inner = <Icon aria-hidden className="footer-social-icon" />;
                return (
                  <li key={id}>
                    {external ? (
                      <a
                        href={href}
                        className="footer-social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link to={href} className="footer-social-link" aria-label={label}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-bottom__legal">
          <Link to="/privacy">Privacy policy</Link>
          <span className="footer-bottom__sep" aria-hidden>
            ·
          </span>
          <Link to="/contact">Contact</Link>
        </p>
        <p className="footer-bottom__copy">© 2026 Bharat Skill Development Academy. All rights reserved.</p>
      </div>
    </footer>
  );
}
