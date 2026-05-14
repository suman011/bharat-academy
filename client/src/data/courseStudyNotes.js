/**
 * Structured study notes for long-format courses where video hours are limited.
 * Keyed by course URL slug (same as CourseDetail slugify(course.name)).
 */

const NOTES = {
  "ai-foundations-for-beginners": {
    intro:
      "Use these notes between video lessons to reinforce vocabulary, map how topics connect, and prepare short written summaries you can reuse in interviews.",
    sections: [
      {
        title: "How to use this track",
        paragraphs: [
          "Aim for two passes: a fast skim before each week’s videos, then a slower read with your own examples (banking, farming, healthcare, etc.).",
          "After each session, write five bullets in your own words—this matters more than highlighting long paragraphs.",
        ],
        bullets: [
          "Keep a one-page glossary: AI, ML, data, model, algorithm, dataset, label, feature, training, inference.",
          "When a demo tool appears in class, note the input, output, and one limitation you observed.",
        ],
      },
      {
        title: "AI vs ML vs data science (working definitions)",
        paragraphs: [
          "Artificial intelligence is the broad goal of systems that show intelligent behaviour. Machine learning is a practical subset where behaviour improves from data rather than only from hand-written rules.",
          "Data science spans problem framing, data collection and cleaning, analysis, visualization, and often ML deployment—but not every data science role trains deep models daily.",
        ],
        bullets: [
          "Rule-based chatbot vs ML-based intent classifier: contrast memorized rules vs patterns learned from examples.",
          "Narrow AI: systems tuned for one task family; keep examples ready (spam filter, fraud score, demand forecast).",
        ],
      },
      {
        title: "Data literacy checkpoints",
        paragraphs: [
          "Structured data fits tables (rows = records, columns = fields). Unstructured data includes text, images, and audio where meaning is harder to extract without preprocessing.",
          "The data lifecycle usually includes capture, storage, cleaning, exploration, modeling, monitoring, and retraining—note where quality issues appear in real organizations.",
        ],
        bullets: [
          "For each dataset you see in class, identify: population, sampling bias risk, missing values, and leakage risks.",
          "Practice describing one chart aloud: what it shows, what it does not show, and one decision it could support.",
        ],
      },
      {
        title: "Ethics, safety, and responsibility",
        paragraphs: [
          "Fairness issues often come from historical bias in data, uneven label quality, or deployment contexts different from training.",
          "Privacy and consent matter even in internal pilots—note what identifiers exist and whether de-identification is realistic.",
        ],
        bullets: [
          "Human-in-the-loop: when should a model only suggest, and when must a human approve?",
          "Failure modes: false positives vs false negatives—link each to user harm for your domain.",
        ],
      },
      {
        title: "Mini-project and portfolio habits",
        paragraphs: [
          "A strong beginner artifact is a short README: problem statement, data source, what you tried, metrics, limits, and next steps.",
          "Screenshots of dashboards or Teachable Machine runs matter less than a clear story of what you changed between attempts.",
        ],
        bullets: [
          "Version simple experiments with dated filenames or a basic folder structure until you learn Git properly.",
          "Prepare a two-minute verbal walkthrough without reading slides—this mirrors interview constraints.",
        ],
      },
    ],
  },

  "python-for-ai-beginner-level": {
    intro:
      "Python is the glue language for most AI workflows. These notes compress syntax you will reuse daily so you can spend video time on intuition and debugging.",
    sections: [
      {
        title: "Environment and habits",
        paragraphs: [
          "Use a single Python version per course project, and prefer virtual environments once you move beyond the first week.",
          "Read errors bottom-up: the last line usually states the exception type; the lines above show the file and line number.",
        ],
        bullets: [
          "Jupyter vs script: notebooks for exploration; `.py` files for reusable functions you import elsewhere.",
          "Restart kernel after structural changes to imports or installed packages to avoid confusing state.",
        ],
      },
      {
        title: "Core syntax for AI scripts",
        paragraphs: [
          "Variables are names bound to objects—no separate declaration keyword. Indentation defines blocks, so keep a consistent 4-space style.",
          "Collections you will see constantly: `list` (ordered), `dict` (key–value), `tuple` (immutable ordered), and `set` (unique elements).",
        ],
        bullets: [
          "`for x in iterable:` and `if / elif / else` cover most control flow in data pipelines.",
          "Comprehensions are concise but avoid nesting so deeply that collaborators cannot read your code.",
        ],
      },
      {
        title: "NumPy mental model",
        paragraphs: [
          "Arrays are homogeneous and fast; operations often broadcast across shapes instead of slow Python loops.",
          "Axis arguments (`axis=0` down rows, `axis=1` across columns in 2D) confuse everyone at first—draw a tiny matrix on paper.",
        ],
        bullets: [
          "Reshape vs transpose: reshape changes layout when element count matches; transpose swaps axes.",
          "Care with copies vs views: modifying a view can surprise you—when in doubt, use `.copy()`.",
        ],
      },
      {
        title: "Pandas for tables",
        paragraphs: [
          "A `DataFrame` is a table; a `Series` is a column. `iloc` is position-based; `loc` is label-based—mixing them up causes subtle bugs.",
          "Group-by splits data into buckets before aggregations—similar conceptually to SQL `GROUP BY`.",
        ],
        bullets: [
          "Always check `df.shape`, `df.dtypes`, and missing counts before modeling.",
          "`read_csv` parameters like `parse_dates` and `na_values` save hours of silent mistakes.",
        ],
      },
      {
        title: "Visualization and communication",
        paragraphs: [
          "Choose charts to match the question: trend over time (line), composition (stacked bar with caution), distribution (histogram or KDE), relationship (scatter).",
          "Label axes with units, cite data sources, and annotate anomalies you can explain.",
        ],
        bullets: [
          "Defaults are fine in class; portfolios benefit from a restrained colour palette and larger fonts.",
          "Export one clean figure per insight rather than overcrowded dashboards for early portfolios.",
        ],
      },
      {
        title: "Toward ML in Python",
        paragraphs: [
          "Scikit-learn prefers numeric matrices—categorical columns often need encoding; text pipelines may use simpler vectorizers before you reach deep learning.",
          "Train vs test discipline prevents overfitting stories that fall apart in deployment.",
        ],
        bullets: [
          "Fit transformers on training data only, then apply to validation/test to mimic real deployment.",
          "Record random seeds and library versions when a result matters for grading or demos.",
        ],
      },
    ],
  },

  "introduction-to-automation-and-robotics": {
    intro:
      "Automation and robotics sit at the intersection of mechanical systems, controls, software, and operations. These notes anchor vocabulary you will hear repeatedly on the plant floor and in integration meetings.",
    sections: [
      {
        title: "Automation in one page",
        paragraphs: [
          "Automation reduces manual variation by using sensors, controllers, actuators, and software workflows to hit repeatable targets (quality, throughput, safety).",
          "Digitalization adds visibility—data from machines and processes—while automation closes loops on physical behaviour.",
        ],
        bullets: [
          "Batch vs continuous processes: control priorities and instrumentation layouts differ.",
          "Manual work does not disappear—it shifts toward supervision, exception handling, and improvement cycles.",
        ],
      },
      {
        title: "Robot building blocks",
        paragraphs: [
          "Sensors measure the world (proximity, vision, force, temperature). Controllers interpret signals and decide. Actuators move or change the process (motors, valves, grippers).",
          "Kinematics describes motion geometry; dynamics adds forces and inertia—know which term is being used in a discussion.",
        ],
        bullets: [
          "End effector: the tool at the arm tip—welding torch, vacuum cup, camera, etc.",
          "Work envelope: reachable space; collisions and cable management matter as much as reach.",
        ],
      },
      {
        title: "PLCs, HMIs, and SCADA (roles)",
        paragraphs: [
          "A PLC executes deterministic logic quickly and reliably for machines and lines. HMIs give operators visibility and control. SCADA supervises broader areas and historical trends.",
          "Ladder logic remains common because electricians can read it—treat that as a collaboration feature, not a legacy annoyance.",
        ],
        bullets: [
          "Interlocks prevent unsafe sequences; document who can bypass them and under what permit.",
          "Alarms should be actionable—note the difference between informational floods and critical safety stops.",
        ],
      },
      {
        title: "Industrial networks (mindset)",
        paragraphs: [
          "OT networks prioritize availability and deterministic timing; office IT prioritizes agility and patch cadence. Convergence needs segmentation and clear ownership.",
          "Protocols like Modbus or OPC-UA appear constantly in integration specs—learn what problem each solves at a high level first.",
        ],
        bullets: [
          "Air-gap myths: data still moves via USB, laptops, and vendors—assume disciplined procedures instead.",
          "Document IP plans, VLAN intent, and firewall rules as living artifacts, not one-time slides.",
        ],
      },
      {
        title: "Safety and standards culture",
        paragraphs: [
          "Standards translate lessons from incidents into repeatable practices—know ISO-oriented vocabulary even if your site uses additional internal rules.",
          "Risk is severity times likelihood; controls should match the risk hierarchy (eliminate, substitute, engineer, administrate, PPE).",
        ],
        bullets: [
          "LOTO is about proving zero hazardous energy before hands enter the danger zone.",
          "Near-miss reporting is a leading indicator—if silence looks good, you may be blind.",
        ],
      },
      {
        title: "Industry 4.0 and smart manufacturing",
        paragraphs: [
          "Industry 4.0 bundles connectivity, analytics, autonomy levels, and human workflows into upgrade roadmaps rather than a single gadget purchase.",
          "Digital twins and simulation reduce commissioning risk when teams share the same model assumptions.",
        ],
        bullets: [
          "KPI dashboards fail when sensors are wrong—validate measurement before celebrating charts.",
          "Change management is part of the technology stack: training, SOPs, and support shifts decide adoption.",
        ],
      },
    ],
  },

  "industrial-safety-standards": {
    intro:
      "Safety is a management system, not a poster campaign. These notes help you connect classroom terms to what auditors, supervisors, and workers actually do.",
    sections: [
      {
        title: "Foundations: hazard, risk, control",
        paragraphs: [
          "A hazard is a source of harm; risk combines likelihood and severity. Controls reduce risk until residual risk is as low as reasonably practicable.",
          "PPE is the last line of defence—still mandatory where hazards remain, but never the only plan.",
        ],
        bullets: [
          "Job safety analysis (JSA) / risk assessment: steps, hazards per step, controls, and responsible persons.",
          "ALARP / reasonable practicability language appears in many legal frameworks—translate it to local site rules.",
        ],
      },
      {
        title: "PPE families and limitations",
        paragraphs: [
          "Head, eye, hand, foot, hearing, and respiratory protection each have classes suited to specific hazards—wrong type creates false confidence.",
          "Inspection cadence: cracked helmets, expired harnesses, saturated chemical gloves—all are failure modes you should recognize.",
        ],
        bullets: [
          "Fit matters for respirators; facial hair and poor seal checks defeat expensive cartridges.",
          "Hi-vis is for visibility, not impact—do not substitute classes incorrectly.",
        ],
      },
      {
        title: "Machine guarding and energy isolation",
        paragraphs: [
          "Guards should prevent access to pinch points, nip points, and moving parts during expected operation and maintenance modes when required.",
          "LOTO procedures must list isolation points, verification steps, and group lockout roles if teams work in parallel.",
        ],
        bullets: [
          "Tryout or zero-energy verification: test on, test off—prove the correct device is locked out.",
          "Stored energy: springs, capacitors, elevated loads—list them explicitly in permits.",
        ],
      },
      {
        title: "Fire safety and emergency response",
        paragraphs: [
          "Classes of fire dictate extinguisher media—using the wrong agent can spread fire or harm people.",
          "Evacuation plans need primary and secondary routes, assembly points, and accountability methods for contractors.",
        ],
        bullets: [
          "Drills should surface bottlenecks—doors that open inward, unclear signage, or blocked exits.",
          "Hot work permits tie welding/grinding to combustible clearance and fire watch assignments.",
        ],
      },
      {
        title: "Permits, confined space, and electrical basics",
        paragraphs: [
          "Permit to work formalizes hazardous tasks with controls, time limits, and sign-offs—treat it as a contract for the shift.",
          "Confined spaces need atmosphere testing, ventilation plans, rescue readiness, and communication methods—not just a harness.",
        ],
        bullets: [
          "Qualified vs competent persons: know which standard your site references for electrical tasks.",
          "Corded tools and GFCI/RCD expectations differ by region—record local rules in your pocket notebook.",
        ],
      },
      {
        title: "Standards, audits, and culture",
        paragraphs: [
          "ISO-style systems emphasize plan–do–check–act: policies, risk registers, audits, corrective actions, and management review.",
          "Audits find gaps; culture determines whether findings become fixes or paperwork theatre.",
        ],
        bullets: [
          "Leading indicators: training completion, near-miss counts, permit quality, housekeeping scores.",
          "Lag indicators: injury rates—useful historically but slow to change after interventions.",
        ],
      },
    ],
  },

  "introduction-to-machine-learning": {
    intro:
      "Machine learning rewards clear definitions: what is the target, what data is allowed, and how will you know you improved something? Use these notes to organize math-light intuition before heavier courses.",
    sections: [
      {
        title: "Problem framing",
        paragraphs: [
          "Start from the decision: who acts on the model output, how often, and what is expensive to get wrong (false positives vs false negatives).",
          "Define leakage: any feature that would not be available at prediction time, or that encodes the label indirectly, invalidates evaluation.",
        ],
        bullets: [
          "Baseline first: majority class, simple rules, or linear models before deep architectures.",
          "Write the unit of prediction: customer, transaction, device, image tile, etc.",
        ],
      },
      {
        title: "Supervised vs unsupervised vs reinforcement",
        paragraphs: [
          "Supervised learning maps inputs to labels (classification or regression). Unsupervised learning finds structure without labels (clustering, dimensionality reduction, anomaly hints).",
          "Reinforcement learning optimizes actions via rewards—powerful but data-hungry and sensitive to reward design.",
        ],
        bullets: [
          "Semi-supervised and self-supervised hybrids appear in practice—note what signal replaces labels.",
          "Choose metrics after costs: accuracy alone misleads on imbalanced problems.",
        ],
      },
      {
        title: "Data splits and honest evaluation",
        paragraphs: [
          "Train on training data, tune on validation, report once on test—or use cross-validation when data is small but compute allows.",
          "Temporal splits matter for forecasting: random shuffles cheat by leaking future into past.",
        ],
        bullets: [
          "Stratify splits for classification to preserve class ratios when counts are low.",
          "Document preprocessing: imputation, scaling, encoding—fit on train, apply everywhere else.",
        ],
      },
      {
        title: "Models you will meet early",
        paragraphs: [
          "Linear and logistic regression remain strong baselines with clear coefficients. Tree ensembles handle non-linearity and interactions with less feature engineering.",
          "Neural networks shine with large homogeneous data (images, text) but need careful tuning and compute.",
        ],
        bullets: [
          "Regularization (L1/L2) fights overfitting by penalizing complexity—connect to your cost function story from math courses.",
          "Calibration matters when outputs are interpreted as probabilities for decisions or pricing.",
        ],
      },
      {
        title: "Overfitting and underfitting",
        paragraphs: [
          "Overfitting: low training error, poor generalization—often from too-rich a model, too few examples, noisy labels, or leakage.",
          "Underfitting: even training error is high—model too simple, features too weak, or optimization issue.",
        ],
        bullets: [
          "Learning curves (error vs training size) tell you whether to collect data or simplify the model.",
          "Error analysis: bucket mistakes by segment to prioritize data fixes vs architecture changes.",
        ],
      },
      {
        title: "Deployment-aware thinking",
        paragraphs: [
          "Latency, hardware, monitoring, and retraining triggers are part of the model lifecycle, not afterthoughts.",
          "Concept drift happens when the world changes—sales mix shifts, new fraud patterns, seasonal regimes.",
        ],
        bullets: [
          "Shadow mode: run new model parallel to old without affecting decisions while comparing distributions.",
          "Human override paths and appeal processes matter in regulated domains.",
        ],
      },
    ],
  },

  "mathematics-for-ai-machine-learning": {
    intro:
      "Math in ML is less about symbolic tricks and more about knowing which tool answers which question—gradients for learning directions, linear algebra for batches of data, probability for uncertainty.",
    sections: [
      {
        title: "Variables, functions, and graphs",
        paragraphs: [
          "A function maps inputs to outputs; in ML the learned function approximates a relationship implied by data rather than a textbook formula alone.",
          "Graphs build intuition for how small input changes move outputs—this is the geometric face of derivatives later.",
        ],
        bullets: [
          "Slope as rate of change links directly to partial derivatives in multi-variable models.",
          "Piecewise linear regions of ReLU networks are still grounded in affine transforms and thresholds.",
        ],
      },
      {
        title: "Vectors, matrices, and shapes",
        paragraphs: [
          "Treat a feature vector as one sample’s coordinates in feature space; a design matrix stacks many samples row-wise or column-wise—always ask which convention code uses.",
          "Matrix multiplication composes linear transformations; deep networks alternate linear layers with non-linearities to approximate complex functions.",
        ],
        bullets: [
          "Dot products relate to angles and projections—similarity metrics often hide a dot product normalization.",
          "Transpose appears when swapping roles of samples and features or aligning dimensions for multiplication.",
        ],
      },
      {
        title: "Calculus for optimization",
        paragraphs: [
          "The derivative tells how a tiny change in a parameter moves the loss, assuming smoothness locally.",
          "Gradient descent steps opposite the gradient to reduce loss; learning rate trades speed vs stability.",
        ],
        bullets: [
          "Partial derivatives assemble into a gradient vector for multi-parameter models.",
          "Chain rule thinking explains backpropagation at a high level—even if implementation is automatic.",
        ],
      },
      {
        title: "Probability and uncertainty",
        paragraphs: [
          "Probabilities quantify uncertainty; conditional probabilities answer ‘given what I already know, what changes?’",
          "Bayes’ theorem updates beliefs when evidence arrives—useful for interpreting diagnostic tests and some classifiers.",
        ],
        bullets: [
          "Independence assumptions simplify math but can be wrong—note where Naive Bayes assumes feature independence.",
          "Gaussian intuition: sums of many small effects often look bell-shaped—central limit reasoning in plain language.",
        ],
      },
      {
        title: "Statistics descriptors",
        paragraphs: [
          "Mean captures central tendency; variance and standard deviation capture spread. Outliers disproportionately affect some models.",
          "Correlation is not causation—confounders explain many ‘signals’ that vanish under controlled experiments.",
        ],
        bullets: [
          "Covariance matrices generalize variance to multiple dimensions—eigen-stories appear in PCA.",
          "When transforming features, track units and interpretability for stakeholders.",
        ],
      },
      {
        title: "Connecting math to ML practice",
        paragraphs: [
          "Loss functions make goals measurable; regularizers encode priors about simplicity or sparsity.",
          "Evaluation metrics should align with business costs—math helps you derive and defend those choices.",
        ],
        bullets: [
          "Keep a cheat-sheet mapping: task → model family → typical loss → metric → failure checks.",
          "Revisit proofs lightly, but prioritize being able to explain each concept with a tiny numeric example.",
        ],
      },
    ],
  },
};

/**
 * @param {string} slug
 * @returns {{ intro: string, sections: Array<{ title: string, paragraphs?: string[], bullets?: string[] }> } | null}
 */
export function getCourseStudyNotes(slug) {
  const key = String(slug || "").trim().toLowerCase();
  if (!key) return null;
  return NOTES[key] || null;
}
