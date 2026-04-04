import { industry40Categories } from "./industry40Catalog";

/** Core IT path: Basic → Intermediate → Advanced (first three groups in the catalog). */
export const IT_CORE_CATEGORY_COUNT = 3;

export const courseCategories = [
  {
    title: "Basic Courses (Foundation Level)",
    color: "basic",
    items: [
      { name: "Computer Fundamentals", price: 1999, duration: "4 weeks", level: "Beginner" },
      { name: "MS Office (Word, Excel, PowerPoint)", price: 3999, duration: "6 weeks", level: "Beginner" },
      { name: "Digital Literacy & Cyber Safety", price: 2499, duration: "3 weeks", level: "Beginner" },
    ]
  },
  {
    title: "Intermediate Courses (Skill Development)",
    color: "intermediate",
    items: [
      { name: "Advance Excel (Dashboard, Pivot, Macros)", price: 6999, duration: "8 weeks", level: "Intermediate" },
      { name: "Advance PowerPoint (Presentation Design)", price: 5499, duration: "6 weeks", level: "Intermediate" },
      { name: "HTML, CSS, Bootstrap", price: 6999, duration: "8 weeks", level: "Intermediate" },
      { name: "JavaScript (ES6+)", price: 8999, duration: "10 weeks", level: "Intermediate" },
      { name: "Git & GitHub", price: 3499, duration: "4 weeks", level: "Intermediate" },
      { name: "C Programming", price: 7999, duration: "10 weeks", level: "Intermediate" },
      { name: "C++ Programming", price: 8999, duration: "12 weeks", level: "Intermediate" },
      { name: "Java Programming", price: 10999, duration: "14 weeks", level: "Intermediate" },
      { name: "Python Programming (Basic + Intermediate)", price: 9999, duration: "12 weeks", level: "Intermediate" },
    ]
  },
  {
    title: "Advanced Courses (Professional Level)",
    color: "advanced",
    items: [
      { name: "Data Structures & Algorithms (DSA)", price: 14999, duration: "20 weeks", level: "Advanced" },
      { name: "Operating System Fundamentals", price: 8999, duration: "10 weeks", level: "Advanced" },
      { name: "Computer Networks", price: 9999, duration: "12 weeks", level: "Advanced" },
      { name: "Database Management System (SQL + MongoDB)", price: 11999, duration: "14 weeks", level: "Advanced" },
      { name: "MERN Stack (MongoDB, Express, React, Node)", price: 24999, duration: "24 weeks", level: "Advanced" },
      { name: "Advanced React.js", price: 12999, duration: "12 weeks", level: "Advanced" },
      { name: "Next.js", price: 10999, duration: "10 weeks", level: "Advanced" },
      { name: "API Development (Node.js / Express)", price: 12999, duration: "12 weeks", level: "Advanced" },
      { name: "AWS Basics (S3, EC2, Lambda)", price: 15999, duration: "12 weeks", level: "Advanced" },
      { name: "CI/CD (GitHub Actions, DevOps Basics)", price: 13999, duration: "10 weeks", level: "Advanced" },
      { name: "Data Analytics (Excel + Power BI)", price: 14999, duration: "12 weeks", level: "Advanced" },
      { name: "Python for Data Science", price: 16999, duration: "14 weeks", level: "Advanced" },
      { name: "Machine Learning Basics", price: 19999, duration: "16 weeks", level: "Advanced" },
      { name: "AI Fundamentals", price: 19999, duration: "16 weeks", level: "Advanced" }
    ]
  },
  ...industry40Categories,
  {
    title: "Specialized / Premium Courses (High Value)",
    color: "industry",
    items: [
      { name: "Full Stack Developer Program (3-6 months)", price: 39999, duration: "24 weeks", level: "Expert" },
      { name: "Data Science Master Program", price: 44999, duration: "24 weeks", level: "Expert" },
      { name: "AI + Machine Learning with Projects", price: 42999, duration: "24 weeks", level: "Expert" },
      { name: "Cyber Security Fundamentals", price: 15999, duration: "16 weeks", level: "Advanced" },
      { name: "Ethical Hacking Basics", price: 17999, duration: "16 weeks", level: "Advanced" }
    ]
  },
  {
    title: "Short Term Courses (1 Month Programs)",
    color: "basic",
    items: [
      { name: "Basic Computer Crash Course", price: 1999, duration: "4 weeks", level: "Beginner" },
      { name: "Excel in 30 Days", price: 2499, duration: "4 weeks", level: "Beginner" },
      { name: "Web Design Basics", price: 2999, duration: "4 weeks", level: "Beginner" },
      { name: "Coding for Beginners", price: 3499, duration: "4 weeks", level: "Beginner" }
    ]
  },
  {
    title: "Job-Oriented Courses",
    color: "job",
    items: [
      { name: "Full Stack Development", price: 24999, duration: "24 weeks", level: "Advanced" },
      { name: "Advanced Excel + MIS", price: 8999, duration: "10 weeks", level: "Intermediate" },
      { name: "Data Analyst Course", price: 16999, duration: "14 weeks", level: "Advanced" },
      { name: "Software Testing (Manual + Automation)", price: 10999, duration: "12 weeks", level: "Advanced" },
      { name: "Resume Building + Interview Preparation", price: 5999, duration: "6 weeks", level: "Intermediate" }
    ]
  },
  {
    title: "Packages (Business Pro Tip)",
    color: "bonus",
    items: [
      { name: "Developer Package (HTML + CSS + JS + React)", price: 21999, duration: "18 weeks", level: "Intermediate" },
      { name: "Pro Package (DSA + Full Stack + Projects)", price: 36999, duration: "28 weeks", level: "Expert" }
    ]
  }
];
