import React, { useEffect, useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import { useSearchParams } from "react-router-dom";
import { apiUrl } from "../utils/apiBase";
import { industry40Categories } from "../data/industry40Catalog";
import { courseCategories, IT_CORE_CATEGORY_COUNT } from "../data/courses";
import CourseCard from "../components/CourseCard";
import ItCoursesTierGrid from "../components/ItCoursesTierGrid";

function parseWeeks(duration) {
  const s = String(duration || "").toLowerCase();
  const m = s.match(/(\d+)\s*week/);
  return m ? Number(m[1]) : null;
}

export default function Courses() {
  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const [level, setLevel] = useState("");
  const [maxWeeks, setMaxWeeks] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [wishlistKeys, setWishlistKeys] = useState(() => new Set());
  const [ratingMap, setRatingMap] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const filterPopoverOpen = Boolean(filterAnchorEl);

  const catalogModules = useMemo(() => {
    return courseCategories.map((category) => ({
      ...category,
      items: category.items.map((course) => {
        const slug = course.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        return {
          ...course,
          category: category.title,
          categoryColor: category.color,
          slug,
          weeks: parseWeeks(course.duration),
        };
      }),
    }));
  }, []);

  const filterActive = Boolean(
    search.trim() ||
      selectedCategory ||
      level ||
      maxWeeks ||
      minPrice ||
      maxPrice ||
      (sortBy && sortBy !== "relevance")
  );

  const filteredModules = useMemo(() => {
    const q = search.toLowerCase();
    const minP = minPrice ? Number(minPrice) : null;
    const maxP = maxPrice ? Number(maxPrice) : null;
    const maxW = maxWeeks ? Number(maxWeeks) : null;
    return catalogModules
      .filter((module) => !selectedCategory || module.title === selectedCategory)
      .map((module) => ({
        ...module,
        items: module.items
          .filter((course) => {
            if (search.trim()) {
              const ok =
                course.name.toLowerCase().includes(q) ||
                module.title.toLowerCase().includes(q);
              if (!ok) return false;
            }
            if (level && String(course.level || "").toLowerCase() !== level.toLowerCase())
              return false;
            if (minP != null && Number(course.price || 0) < minP) return false;
            if (maxP != null && Number(course.price || 0) > maxP) return false;
            if (maxW != null && course.weeks != null && Number(course.weeks) > maxW) return false;
            return true;
          })
          .sort((a, b) => {
            if (sortBy === "price_asc") return Number(a.price || 0) - Number(b.price || 0);
            if (sortBy === "price_desc") return Number(b.price || 0) - Number(a.price || 0);
            if (sortBy === "duration_asc") return Number(a.weeks || 0) - Number(b.weeks || 0);
            if (sortBy === "duration_desc") return Number(b.weeks || 0) - Number(a.weeks || 0);
            if (sortBy === "name_asc") return String(a.name || "").localeCompare(String(b.name || ""));
            return 0;
          }),
      }))
      .filter((module) => module.items.length > 0);
  }, [catalogModules, search, selectedCategory, level, maxWeeks, minPrice, maxPrice, sortBy]);

  const allModuleTitles = useMemo(
    () => courseCategories.map((category) => category.title),
    []
  );

  const itCoreTitles = useMemo(
    () => courseCategories.slice(0, IT_CORE_CATEGORY_COUNT).map((c) => c.title),
    []
  );

  const industry40Titles = useMemo(
    () => industry40Categories.map((c) => c.title),
    []
  );

  const chipModuleTitles = useMemo(
    () =>
      allModuleTitles.filter(
        (t) => !itCoreTitles.includes(t) && !industry40Titles.includes(t)
      ),
    [allModuleTitles, itCoreTitles, industry40Titles]
  );

  const showItThreeColumn = !filterActive;

  const extensionModules = useMemo(() => {
    if (!showItThreeColumn) return [];
    return filteredModules.filter(
      (m) => !itCoreTitles.includes(m.title) && !industry40Titles.includes(m.title)
    );
  }, [filteredModules, itCoreTitles, industry40Titles, showItThreeColumn]);

  const renderModuleSection = (module) => (
    <section key={module.title} className="catalog-module-section">
      <div className="catalog-module-head">
        <h2>{module.title}</h2>
        <span>{module.items.length} Courses</span>
      </div>
      <div className="course-catalog-grid">
        {module.items.map((course, index) => (
          <CourseCard
            key={`${module.title}-${index}`}
            course={course}
            revealIndex={index}
            inWishlist={wishlistKeys.has(course.slug)}
            ratingSummary={ratingMap[course.slug]}
          />
        ))}
      </div>
    </section>
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(apiUrl("/wishlist"), { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return;
        const keys = new Set((data.items || []).map((x) => String(x.courseKey || "").toLowerCase()).filter(Boolean));
        if (!alive) return;
        setWishlistKeys(keys);
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const keys = filteredModules.flatMap((m) => m.items.map((c) => c.slug));
    const uniq = Array.from(new Set(keys)).filter(Boolean);
    if (uniq.length === 0) return () => {};
    (async () => {
      try {
        const res = await fetch(apiUrl("/reviews/summary"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseKeys: uniq }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) return;
        if (!alive) return;
        setRatingMap(data.summary || {});
      } catch {
        // ignore
      }
    })();
    return () => {
      alive = false;
    };
  }, [filteredModules]);

  function clearAllFilters() {
    setLevel("");
    setMaxWeeks("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("relevance");
    setSearch("");
    setSearchParams({});
    setFilterAnchorEl(null);
  }

  function toggleFilterPopover(event) {
    setFilterAnchorEl((el) => (el ? null : event.currentTarget));
  }

  function closeFilterPopover() {
    setFilterAnchorEl(null);
  }

  const chipSx = {
    height: "auto",
    py: 0.75,
    "& .MuiChip-label": {
      whiteSpace: "normal",
      textAlign: "center",
      display: "block",
      lineHeight: 1.35,
    },
  };

  const advancedFilterCount = useMemo(() => {
    let n = 0;
    if (level) n += 1;
    if (maxWeeks) n += 1;
    if (minPrice) n += 1;
    if (maxPrice) n += 1;
    if (sortBy && sortBy !== "relevance") n += 1;
    return n;
  }, [level, maxWeeks, minPrice, maxPrice, sortBy]);

  const totalCourses = filteredModules.reduce((sum, m) => sum + m.items.length, 0);

  return (
    <section className="section-page">
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, md: 3 } }}>
        <Box className="page-head catalog-page-head theme-section-head">
          <span className="catalog-page-head__eyebrow">All Courses</span>
          <h1>Complete Course Catalog</h1>
          <p>Search any course from your academy list.</p>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "stretch",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px",
              bgcolor: "background.paper",
              overflow: "hidden",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              "&:focus-within": {
                borderColor: "primary.main",
                boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.14)",
              },
            }}
          >
            <TextField
              fullWidth
              id="catalog-search"
              variant="standard"
              placeholder="Search courses like React, Excel, Python, AI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              inputProps={{ "aria-label": "Search courses", enterKeyHint: "search" }}
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" fontSize="small" />
                  </InputAdornment>
                ),
                sx: {
                  py: 1.75,
                  px: 1,
                  pl: 2,
                  fontSize: "1rem",
                },
              }}
              sx={{ flex: 1, minWidth: 0 }}
            />
            <Divider orientation="vertical" flexItem variant="middle" sx={{ my: 1.25 }} />
            <Badge
              badgeContent={advancedFilterCount}
              color="primary"
              invisible={advancedFilterCount === 0}
              sx={{
                flexShrink: 0,
                alignSelf: "stretch",
                display: "flex",
                alignItems: "center",
                "& .MuiBadge-badge": {
                  right: 10,
                  top: 10,
                  fontSize: "0.7rem",
                  minWidth: 18,
                  height: 18,
                },
              }}
            >
              <Button
                id="catalog-filter-sort-button"
                variant="text"
                color="inherit"
                onClick={toggleFilterPopover}
                aria-label="Open filters and sort"
                aria-expanded={filterPopoverOpen ? "true" : "false"}
                aria-controls="catalog-filters-popover"
                aria-haspopup="true"
                startIcon={<TuneIcon color="action" fontSize="small" />}
                endIcon={
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={{
                      transition: "transform 0.2s ease",
                      transform: filterPopoverOpen ? "rotate(180deg)" : "none",
                    }}
                  />
                }
                sx={{
                  minWidth: "auto",
                  px: 1.25,
                  py: 1,
                  borderRadius: 0,
                  fontWeight: 600,
                  textTransform: "none",
                  gap: 0.25,
                }}
              />
            </Badge>
          </Box>

          <Popover
            id="catalog-filters-popover"
            open={filterPopoverOpen}
            anchorEl={filterAnchorEl}
            onClose={closeFilterPopover}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                elevation: 8,
                sx: {
                  mt: 1,
                  p: 2,
                  width: { xs: "min(calc(100vw - 24px), 400px)", sm: 420 },
                  maxWidth: "calc(100vw - 24px)",
                  borderRadius: "12px",
                },
              },
            }}
          >
            <Grid container spacing={2} aria-label="Advanced filters">
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                  <MenuItem value="Expert">Expert</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Max duration (weeks)"
                  type="number"
                  inputProps={{ min: 1, inputMode: "numeric" }}
                  placeholder="e.g. 8"
                  value={maxWeeks}
                  onChange={(e) => setMaxWeeks(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Min price"
                  type="number"
                  inputProps={{ min: 0, inputMode: "decimal" }}
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Max price"
                  type="number"
                  inputProps={{ min: 0, inputMode: "decimal" }}
                  placeholder="Any"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  label="Sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="price_asc">Price: Low to High</MenuItem>
                  <MenuItem value="price_desc">Price: High to Low</MenuItem>
                  <MenuItem value="duration_asc">Duration: Short to Long</MenuItem>
                  <MenuItem value="duration_desc">Duration: Long to Short</MenuItem>
                  <MenuItem value="name_asc">Name: A-Z</MenuItem>
                </TextField>
              </Grid>
              <Grid size={12}>
                <Button fullWidth variant="outlined" color="primary" onClick={clearAllFilters} sx={{ py: 1.1 }}>
                  Clear all
                </Button>
              </Grid>
            </Grid>
          </Popover>
        </Box>

        <Box
          className="catalog-module-filter"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.25,
            mb: 3,
            alignItems: "stretch",
          }}
        >
          <Chip
            label="All Modules"
            onClick={() => setSearchParams({})}
            color={!selectedCategory ? "primary" : "default"}
            variant={!selectedCategory ? "filled" : "outlined"}
            sx={chipSx}
          />
          {chipModuleTitles.map((title) => (
            <Chip
              key={title}
              label={title}
              onClick={() => setSearchParams({ category: title })}
              color={selectedCategory === title ? "primary" : "default"}
              variant={selectedCategory === title ? "filled" : "outlined"}
              sx={chipSx}
            />
          ))}
        </Box>

        {filteredModules.length > 0 ? (
          <div className="catalog-results-summary" role="status" aria-live="polite" style={{ marginBottom: 22 }}>
            Showing <strong>{totalCourses}</strong> course{totalCourses === 1 ? "" : "s"}
          </div>
        ) : null}

        {showItThreeColumn ? (
          <ItCoursesTierGrid
            categories={courseCategories.slice(0, IT_CORE_CATEGORY_COUNT)}
            className="it-courses-block--catalog"
            eyebrow="Learning tracks"
            title="IT Courses"
            lede="Three clear levels — start where you fit, then grow into advanced engineering and industry skills."
            layout="rows"
          />
        ) : null}

        {showItThreeColumn ? (
          <ItCoursesTierGrid
            categories={industry40Categories}
            className="it-courses-block--catalog it-courses-block--i4-after-it"
            eyebrow="Learning tracks"
            title="Automation and Robotics courses"
            lede="Three clear levels — start where you fit, then grow into PLC, SCADA, IIoT, robotics, analytics, OT security, and smart factory architecture."
            layout="rows"
          />
        ) : null}

        {showItThreeColumn && extensionModules.length > 0 ? (
          <>
            <h2 className="catalog-more-heading">More programs</h2>
            {extensionModules.map((module) => renderModuleSection(module))}
          </>
        ) : null}

        {!showItThreeColumn && filteredModules.length > 0
          ? filteredModules.map((module) => renderModuleSection(module))
          : null}

        {filteredModules.length === 0 ? (
          <div className="empty-state" role="status" aria-live="polite">
            <div className="empty-state__title">
              {search.trim() ? `No courses found for “${search}”` : "No courses match this filter."}
            </div>
            <div className="empty-state__subtitle">
              Try clearing filters or searching by a broader keyword.
            </div>
            <div className="empty-state-actions">
              <button type="button" className="secondary-btn" onClick={clearAllFilters}>
                Clear filters
              </button>
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
