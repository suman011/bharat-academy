export function getCourseKeyPoints(course) {
  const name = String(course?.name || "").toLowerCase();
  const points = [];

  // A few smart highlights based on common course names
  if (name.includes("python")) points.push("Hands-on Python practice");
  if (name.includes("java")) points.push("Core + OOP concepts");
  if (name.includes("excel")) points.push("Real-world Excel tasks");
  if (name.includes("tally")) points.push("Accounting + GST basics");
  if (name.includes("plc") || name.includes("scada")) points.push("Industrial automation basics");
  if (name.includes("machine learning")) {
    points.push(name.includes("project") ? "ML workflows + projects" : "Supervised & unsupervised ML");
  } else if (name.includes("ai") || name.includes("artificial intelligence")) {
    points.push("AI concepts + hands-on labs");
  }

  if (course?.duration) points.push(String(course.duration));
  if (course?.level) points.push(String(course.level));

  const uniq = Array.from(new Set(points)).slice(0, 3);
  return uniq.length ? uniq : ["Practical sessions", "Certificate", "Career guidance"];
}

