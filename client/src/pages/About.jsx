import React from "react";

export default function About() {
  return (
    <section className="section-page about-page">
      <div className="container narrow about-page__wrap">
        <div className="about-page__grid">
          <header className="page-head about-page__head">
            <span>About Us</span>
            <h1>Bharat Skill Development Academy</h1>
            <p>Computer training, engineering depth, and industry skills in one place.</p>
          </header>

          <div className="info-card about-page__card">
            <p className="about-page__lead">
              This academy website is designed for students, job seekers, and professionals
              who want to build skills in modern computer technologies.
            </p>
            <p>
              The course list covers fundamentals, programming, MERN stack, AI, cyber security,
              job preparation, and industry-oriented automation learning.
            </p>
            <p className="about-page__highlight">
              The biggest differentiator is the combination of{" "}
              <strong>software skills + future technology + industry exposure</strong>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
