import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal,
  BadgeCheck,
} from "lucide-react";
import PitchGridCard from "../../components/shared/PitchGridCard";
import Button from "../../components/ui/Button";
import { useProjects } from "../../lib/hooks";
import { projectsApi } from "../../lib/api";

const allCategories = [
  "All Categories",
  "Fashion & Textile",
  "HealthTech",
  "AgriTech",
  "EdTech",
  "FinTech",
  "Clean Energy",
  "Construction",
  "E-Commerce",
];

const allLocations = [
  "All Locations",
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Kaduna",
  "Abeokuta",
];

const allStages = ["All Stages", "Idea", "MVP", "Growth", "Scale"];

interface Filters {
  category: string;
  location: string;
  stage: string;
  fundingMin: string;
  fundingMax: string;
}

const defaultFilters: Filters = {
  category: "All Categories",
  location: "All Locations",
  stage: "All Stages",
  fundingMin: "",
  fundingMax: "",
};

function getActiveFilterTags(
  filters: Filters,
): { label: string; key: keyof Filters }[] {
  const tags: { label: string; key: keyof Filters }[] = [];
  if (filters.category !== "All Categories")
    tags.push({ label: filters.category, key: "category" });
  if (filters.location !== "All Locations")
    tags.push({ label: filters.location, key: "location" });
  if (filters.stage !== "All Stages")
    tags.push({ label: filters.stage, key: "stage" });
  if (filters.fundingMin)
    tags.push({
      label: `Min ₦${Number(filters.fundingMin).toLocaleString()}`,
      key: "fundingMin",
    });
  if (filters.fundingMax)
    tags.push({
      label: `Max ₦${Number(filters.fundingMax).toLocaleString()}`,
      key: "fundingMax",
    });
  return tags;
}

const quickFilters = [
  "All",
  "Fashion & Textile",
  "Lagos",
  "Under ₦5M",
  "HealthTech",
  "Growth Stage",
];

export default function DiscoverProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({ ...defaultFilters });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({ ...defaultFilters });
  const [likedPitches, setLikedPitches] = useState<Set<string>>(new Set());
  const [bookmarkedPitches, setBookmarkedPitches] = useState<Set<string>>(new Set());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true, location: true, funding: true, stage: true,
  });

  // Build API params from applied filters
  const apiParams: Record<string, string> = {};
  if (searchQuery) apiParams.search = searchQuery;
  if (appliedFilters.category !== "All Categories") apiParams.category = appliedFilters.category.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_");
  if (appliedFilters.location !== "All Locations") apiParams.country = appliedFilters.location;
  if (appliedFilters.fundingMin) apiParams.min_goal = appliedFilters.fundingMin;
  if (appliedFilters.fundingMax) apiParams.max_goal = appliedFilters.fundingMax;

  const { data: apiProjects, loading, meta } = useProjects(apiParams);

  // Map backend project shape to PitchCard shape for the existing card component
  const pitches = useMemo(() => apiProjects.map((p: any) => ({
    id: p.id,
    title: p.title,
    description: p.description || "",
    category: p.category,
    fundingGoal: parseFloat(p.funding_goal),
    currentFunding: parseFloat(p.amount_raised),
    entrepreneurName: p.entrepreneur_name || "Entrepreneur",
    entrepreneurAvatar: "",
    companyName: p.entrepreneur_name || "",
    location: p.country || p.city || "",
    createdAt: p.created_at,
    tags: [],
    stage: "mvp" as const,
    likes: 0,
    views: 0,
    image: p.cover_image || "",
    verified: true,
  })), [apiProjects]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
    setMobileSidebarOpen(false);
  };

  const clearAllFilters = () => {
    const cleared = { ...defaultFilters };
    setFilters(cleared);
    setAppliedFilters(cleared);
  };

  const removeFilterTag = (key: keyof Filters) => {
    const resetValue =
      key === "category"
        ? "All Categories"
        : key === "location"
          ? "All Locations"
          : key === "stage"
            ? "All Stages"
            : "";
    setFilters((prev) => ({ ...prev, [key]: resetValue }));
    setAppliedFilters((prev) => ({ ...prev, [key]: resetValue }));
  };

  const handleQuickFilter = (qf: string) => {
    if (qf === "All") {
      clearAllFilters();
      return;
    }
    if (allCategories.includes(qf)) {
      const newFilters = { ...appliedFilters, category: qf };
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    } else if (allLocations.includes(qf)) {
      const newFilters = { ...appliedFilters, location: qf };
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    } else if (qf === "Under ₦5M") {
      const newFilters = { ...appliedFilters, fundingMax: "5000000" };
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    } else if (qf === "Growth Stage") {
      const newFilters = { ...appliedFilters, stage: "Growth" };
      setFilters(newFilters);
      setAppliedFilters(newFilters);
    }
  };

  const toggleLike = (id: string) => {
    setLikedPitches((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleBookmark = (id: string) => {
    // Call real API to save/unsave project
    projectsApi.save(id).catch(() => {});
    setBookmarkedPitches((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const activeTags = getActiveFilterTags(appliedFilters);
  const totalVerified = pitches.length;

  const filterSidebar = (
    <div className="space-y-5">
      {/* Category */}
      <FilterSection
        title="Category"
        expanded={expandedSections.category}
        onToggle={() => toggleSection("category")}
      >
        <div className="space-y-1">
          {allCategories.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === cat}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, category: cat }))
                }
                className="w-3.5 h-3.5 text-brand-500 border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
              <span
                className={`text-sm ${filters.category === cat ? "font-medium text-slate-800" : "text-slate-600"}`}
              >
                {cat}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection
        title="Location"
        expanded={expandedSections.location}
        onToggle={() => toggleSection("location")}
      >
        <div className="space-y-1">
          {allLocations.map((loc) => (
            <label
              key={loc}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="location"
                checked={filters.location === loc}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, location: loc }))
                }
                className="w-3.5 h-3.5 text-brand-500 border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
              <span
                className={`text-sm ${filters.location === loc ? "font-medium text-slate-800" : "text-slate-600"}`}
              >
                {loc}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Funding Range */}
      <FilterSection
        title="Funding Range (₦)"
        expanded={expandedSections.funding}
        onToggle={() => toggleSection("funding")}
      >
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.fundingMin}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, fundingMin: e.target.value }))
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 transition-all"
          />
          <span className="text-slate-300 text-sm">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.fundingMax}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, fundingMax: e.target.value }))
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-100 transition-all"
          />
        </div>
      </FilterSection>

      {/* Stage */}
      <FilterSection
        title="Project Stage"
        expanded={expandedSections.stage}
        onToggle={() => toggleSection("stage")}
      >
        <div className="space-y-1">
          {allStages.map((stg) => (
            <label
              key={stg}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="stage"
                checked={filters.stage === stg}
                onChange={() => setFilters((prev) => ({ ...prev, stage: stg }))}
                className="w-3.5 h-3.5 text-brand-500 border-slate-300 focus:ring-brand-500 cursor-pointer"
              />
              <span
                className={`text-sm ${filters.stage === stg ? "font-medium text-slate-800" : "text-slate-600"}`}
              >
                {stg}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Buttons */}
      <div className="space-y-2 pt-2">
        <Button variant="primary" size="md" fullWidth onClick={applyFilters}>
          Apply Filters
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      {/* Active Filters */}
      {activeTags.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Active Filters
          </p>
          <div className="flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <motion.span
                key={tag.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-brand-50 text-brand-700 rounded-lg border border-brand-100"
              >
                {tag.label}
                <button
                  onClick={() => removeFilterTag(tag.key)}
                  className="hover:text-brand-900 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="max-w-360 mx-auto flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 border-r border-slate-100 bg-white">
          <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-6">
            <div className="flex items-center gap-2 mb-6">
              <SlidersHorizontal size={18} className="text-slate-500" />
              <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
                Filters
              </h2>
            </div>
            {filterSidebar}
          </div>
        </aside>

        {/* Mobile filter overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-50 lg:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-slate-500" />
                    <h2 className="text-sm font-semibold text-slate-800">
                      Filters
                    </h2>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-5 overflow-y-auto h-[calc(100%-57px)]">
                  {filterSidebar}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit] tracking-tight">
                  Discover Projects
                </h1>
                <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <BadgeCheck size={14} className="text-brand-500" />
                  <span>
                    <span className="font-semibold text-slate-700">{totalVerified}</span>{" "}live projects.
                  </span>
                  <span>Showing <span className="font-semibold text-slate-700">{loading ? "..." : pitches.length}</span></span>
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
                />
              </div>
            </div>

            {/* Quick Filters (horizontal pills) */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
              <button
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-white border border-slate-200 text-slate-600 rounded-lg whitespace-nowrap hover:bg-slate-50 transition-all cursor-pointer"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <SlidersHorizontal size={13} /> Filters
              </button>
              {quickFilters.map((qf) => {
                const isActive =
                  (qf === "All" && activeTags.length === 0) ||
                  (qf !== "All" && activeTags.some((t) => t.label === qf)) ||
                  (qf === "Under ₦5M" &&
                    appliedFilters.fundingMax === "5000000") ||
                  (qf === "Growth Stage" && appliedFilters.stage === "Growth");
                return (
                  <button
                    key={qf}
                    onClick={() => handleQuickFilter(qf)}
                    className={`px-4 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-brand-500 text-white shadow-sm shadow-brand-500/20"
                        : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {qf}
                  </button>
                );
              })}
            </div>

            {/* Active filter tags on mobile */}
            {activeTags.length > 0 && (
              <div className="lg:hidden flex flex-wrap gap-2 mb-5">
                {activeTags.map((tag) => (
                  <span
                    key={tag.key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-brand-50 text-brand-700 rounded-lg border border-brand-100"
                  >
                    {tag.label}
                    <button
                      onClick={() => removeFilterTag(tag.key)}
                      className="hover:text-brand-900 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-slate-500 hover:text-slate-700 px-2 cursor-pointer"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Pitch Cards Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-100 h-64 animate-pulse" />
                ))}
              </div>
            ) : pitches.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 font-[Outfit]">
                  No projects found
                </h3>
                <p className="text-sm text-slate-400 mt-1 mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence mode="popLayout">
                  {pitches.map((pitch, i) => (
                    <PitchGridCard
                      key={pitch.id}
                      pitch={pitch}
                      index={i}
                      isLiked={likedPitches.has(pitch.id)}
                      isBookmarked={bookmarkedPitches.has(pitch.id)}
                      onLike={() => toggleLike(pitch.id)}
                      onBookmark={() => toggleBookmark(pitch.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 pb-5">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full mb-3 cursor-pointer group"
      >
        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
          {title}
        </span>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
