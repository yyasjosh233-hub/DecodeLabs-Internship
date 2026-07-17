import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  countries,
  companies,
  learningPaths,
  calculateDJMatch,
  getCompaniesWithScores,
} from '../data/roboticsCompanies';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const ALL = 'all';

const CATEGORY_OPTIONS = [
  ALL,
  'Humanoid Robotics',
  'Physical AI',
  'Industrial Robotics',
  'Warehouse Robotics',
  'Autonomous Mobile Robots',
  'AI-Powered Robotics',
  'Social-Impact Robotics',
];

const SKILL_OPTIONS = [
  ALL,
  'ROS 2',
  'Nav2',
  'Python',
  'C++',
  'SLAM',
  'Computer Vision',
  'PyTorch',
  'Artificial Intelligence',
  'Robot Kinematics',
  'Motion Planning',
];

const DJ_FILTER_OPTIONS = [
  { value: ALL, label: 'All Companies' },
  { value: 'HIGH_MATCH', label: 'High DJ Match' },
  { value: 'ROS2', label: 'ROS 2 Relevant' },
  { value: 'NAV2', label: 'Nav2 Relevant' },
  { value: 'PHYSICAL_AI', label: 'Physical AI Relevant' },
];

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

/** Badge shown on company cards for DJ match level */
function DJMatchBadge({ score, label }) {
  let color = '#6B7280';
  let bg = 'rgba(107,114,128,0.1)';
  let border = 'rgba(107,114,128,0.2)';

  if (score >= 80) {
    color = '#10B981';
    bg = 'rgba(16,185,129,0.1)';
    border = 'rgba(16,185,129,0.2)';
  } else if (score >= 60) {
    color = '#ffde59';
    bg = 'rgba(255,222,89,0.1)';
    border = 'rgba(255,222,89,0.2)';
  } else if (score >= 40) {
    color = '#3B82F6';
    bg = 'rgba(59,130,246,0.1)';
    border = 'rgba(59,130,246,0.2)';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.25rem 0.65rem',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: '50px',
        color,
        fontSize: '0.7rem',
        fontWeight: 800,
        letterSpacing: '0.5px',
      }}
    >
      DJ {score}% · {label}
    </span>
  );
}

/** Horizontal learning path steps */
function LearningPathDisplay({ steps }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {steps.map((step, i) => (
        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span
            style={{
              background: 'rgba(255,222,89,0.07)',
              border: '1px solid rgba(255,222,89,0.15)',
              color: '#fff',
              borderRadius: '6px',
              padding: '0.3rem 0.8rem',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            {step}
          </span>
          {i < steps.length - 1 && (
            <span style={{ color: 'rgba(255,222,89,0.4)', fontSize: '0.9rem', marginLeft: '1rem' }}>↓</span>
          )}
        </div>
      ))}
    </div>
  );
}

/** Tag pill for skills / focus areas */
function Tag({ label, color = 'rgba(255,255,255,0.08)', textColor = '#a0a0a0', border = 'rgba(255,255,255,0.06)' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.55rem',
        background: color,
        border: `1px solid ${border}`,
        borderRadius: '4px',
        fontSize: '0.72rem',
        color: textColor,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────
// COMPANY DETAILS MODAL
// ─────────────────────────────────────────────

function CompanyDetailsModal({ company, onClose }) {
  const path = learningPaths[company.learningPathCategory] || [];

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const dj = calculateDJMatch(company);

  return (
    <div
      className="grc-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-company-name"
    >
      <div
        className="grc-modal-panel"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close */}
        <button className="grc-modal-close" onClick={onClose} aria-label="Close details">✕</button>

        {/* Header */}
        <div className="grc-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.5rem' }}>{company.flag}</span>
            <div>
              <h2 id="modal-company-name" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                {company.name}
              </h2>
              <p style={{ color: '#a0a0a0', fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                {company.country} · {company.countryCode} · {company.category}
              </p>
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <DJMatchBadge score={dj.score} label={dj.label} />
          </div>
        </div>

        {/* Body */}
        <div className="grc-modal-body">

          {/* Description */}
          <section className="grc-modal-section">
            <h3 className="grc-modal-section-title">About</h3>
            <p className="grc-muted">{company.description}</p>
          </section>

          {/* Platforms */}
          {company.roboticsPlatforms.length > 0 && (
            <section className="grc-modal-section">
              <h3 className="grc-modal-section-title">Known Robotics Platforms</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {company.roboticsPlatforms.map((p) => (
                  <Tag key={p} label={p} color="rgba(59,130,246,0.1)" textColor="#60A5FA" border="rgba(59,130,246,0.2)" />
                ))}
              </div>
            </section>
          )}

          {/* Focus Areas */}
          <section className="grc-modal-section">
            <h3 className="grc-modal-section-title">Robotics Focus Areas</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {company.focusAreas.map((f) => (
                <Tag key={f} label={f} color="rgba(255,222,89,0.06)" textColor="#ccc" border="rgba(255,222,89,0.12)" />
              ))}
            </div>
          </section>

          {/* Relevant Skills */}
          <section className="grc-modal-section">
            <h3 className="grc-modal-section-title">Relevant Technical Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {company.relevantSkills.map((s) => (
                <Tag key={s} label={s} color="rgba(16,185,129,0.07)" textColor="#6EE7B7" border="rgba(16,185,129,0.15)" />
              ))}
            </div>
          </section>

          {/* DJ Relevant Areas */}
          <section className="grc-modal-section">
            <h3 className="grc-modal-section-title">DJ Relevant Areas</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {company.djRelevantAreas.map((a) => (
                <Tag key={a} label={a} color="rgba(139,92,246,0.1)" textColor="#C4B5FD" border="rgba(139,92,246,0.2)" />
              ))}
            </div>
          </section>

          {/* DJ Match */}
          <section className="grc-modal-section grc-match-box">
            <h3 className="grc-modal-section-title">DJ Skill Match Analysis</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div className="grc-score-ring">
                <span className="grc-score-number">{dj.score}</span>
                <span className="grc-score-pct">%</span>
              </div>
              <div>
                <DJMatchBadge score={dj.score} label={dj.label} />
                <p className="grc-muted" style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  Matched DJ skills: {dj.matchedTerms.join(', ')}
                </p>
              </div>
            </div>
            <p className="grc-disclaimer">
              Match score is calculated locally from the overlap between DJ technology areas and company robotics focus areas. It is not an employment probability.
            </p>
          </section>

          {/* Learning Path */}
          {path.length > 0 && (
            <section className="grc-modal-section">
              <h3 className="grc-modal-section-title">Suggested Technical Learning Direction</h3>
              <LearningPathDisplay steps={path} />
            </section>
          )}

          {/* Website */}
          {company.officialWebsite && (
            <section className="grc-modal-section" style={{ paddingBottom: 0 }}>
              <a
                href={company.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="grc-btn grc-btn-accent"
              >
                🌐 Visit Official Website
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPANY COMPARISON MODAL
// ─────────────────────────────────────────────

function CompanyComparisonModal({ selected, allCompanies, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const selectedCompanies = selected.map((id) => allCompanies.find((c) => c.id === id)).filter(Boolean);

  const rows = [
    { label: 'Country', key: (c) => `${c.flag} ${c.country}` },
    { label: 'Category', key: (c) => c.category },
    { label: 'Focus Areas', key: (c) => c.focusAreas.join(', ') },
    { label: 'Relevant Skills', key: (c) => c.relevantSkills.join(', ') },
    { label: 'Known Platforms', key: (c) => c.roboticsPlatforms.length ? c.roboticsPlatforms.join(', ') : '—' },
    { label: 'DJ Relevant Areas', key: (c) => c.djRelevantAreas.join(', ') },
    { label: 'DJ Match', key: (c) => { const d = calculateDJMatch(c); return `${d.score}% — ${d.label}`; } },
  ];

  return (
    <div className="grc-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Company Comparison">
      <div className="grc-modal-panel grc-compare-panel" onClick={(e) => e.stopPropagation()}>
        <button className="grc-modal-close" onClick={onClose} aria-label="Close comparison">✕</button>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '1.5rem', color: '#fff' }}>
          ⚖️ Company Comparison
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table className="grc-compare-table">
            <thead>
              <tr>
                <th>Attribute</th>
                {selectedCompanies.map((c) => (
                  <th key={c.id}>{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="grc-compare-attr">{row.label}</td>
                  {selectedCompanies.map((c) => (
                    <td key={c.id} className="grc-compare-cell">{row.key(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPANY CARD
// ─────────────────────────────────────────────

function RoboticsCompanyCard({ company, onViewDetails, compareSelected, onToggleCompare }) {
  const dj = calculateDJMatch(company);
  const isInCompare = compareSelected.includes(company.id);
  const canAddToCompare = compareSelected.length < 3 || isInCompare;

  return (
    <div className={`grc-company-card ${isInCompare ? 'grc-compare-selected' : ''}`}>
      {/* Card Header */}
      <div className="grc-card-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.4rem' }} aria-label={company.country}>{company.flag}</span>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>
              {company.country} · {company.countryCode}
            </div>
          </div>
        </div>
        {company.skillMatch === 'HIGH' && (
          <span className="grc-high-match-badge">⭐ HIGH DJ MATCH</span>
        )}
      </div>

      {/* Company Name */}
      <h3 className="grc-company-name">{company.name}</h3>
      <p className="grc-company-category">{company.category}</p>
      <p className="grc-company-desc">{company.description.length > 140 ? company.description.slice(0, 140) + '…' : company.description}</p>

      {/* Focus Areas */}
      <div className="grc-tag-group">
        <span className="grc-tag-label">Focus</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {company.focusAreas.slice(0, 3).map((f) => (
            <Tag key={f} label={f} />
          ))}
        </div>
      </div>

      {/* Relevant Skills */}
      <div className="grc-tag-group">
        <span className="grc-tag-label">Skills</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {company.relevantSkills.slice(0, 5).map((s) => (
            <Tag key={s} label={s} color="rgba(16,185,129,0.07)" textColor="#6EE7B7" border="rgba(16,185,129,0.15)" />
          ))}
        </div>
      </div>

      {/* DJ Match */}
      <div className="grc-card-dvj-row">
        <DJMatchBadge score={dj.score} label={dj.label} />
      </div>

      {/* Actions */}
      <div className="grc-card-actions">
        <button className="grc-btn grc-btn-primary" onClick={() => onViewDetails(company)}>
          View Company Details
        </button>
        <button
          className={`grc-btn ${isInCompare ? 'grc-btn-compare-active' : 'grc-btn-compare'}`}
          onClick={() => onToggleCompare(company.id)}
          disabled={!canAddToCompare}
          aria-pressed={isInCompare}
          aria-label={isInCompare ? `Remove ${company.name} from comparison` : `Add ${company.name} to comparison`}
          title={!canAddToCompare ? 'Maximum 3 companies for comparison' : ''}
        >
          {isInCompare ? '✓ Comparing' : '+ Compare'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COUNTRY CARD
// ─────────────────────────────────────────────

function CountryCard({ country, isSelected, onSelect, companyCount }) {
  return (
    <button
      className={`grc-country-card ${isSelected ? 'grc-country-selected' : ''}`}
      onClick={() => onSelect(country.id)}
      aria-pressed={isSelected}
      aria-label={`Select ${country.name}`}
    >
      <span className="grc-country-flag" role="img" aria-label={country.name}>{country.flag}</span>
      <div className="grc-country-info">
        <div className="grc-country-name">{country.name}</div>
        <div className="grc-country-code">{country.code}</div>
        <div className="grc-country-count">{companyCount} {companyCount === 1 ? 'company' : 'companies'}</div>
      </div>
      <p className="grc-country-desc">{country.shortDesc}</p>
      {isSelected && <span className="grc-selected-indicator">✓ Selected</span>}
    </button>
  );
}

// ─────────────────────────────────────────────
// COUNTRY OVERVIEW
// ─────────────────────────────────────────────

function CountryIndustryOverview({ country }) {
  if (!country) return null;
  return (
    <div className="grc-country-overview">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem' }}>
        <span style={{ fontSize: '2rem' }}>{country.flag}</span>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>
          {country.name} Robotics Ecosystem
        </h2>
      </div>
      <p className="grc-muted" style={{ marginBottom: '1rem' }}>{country.overview}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {country.industryFocus.map((f) => (
          <Tag key={f} label={f} color="rgba(255,222,89,0.07)" textColor="#ffde59" border="rgba(255,222,89,0.18)" />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BEST DJ MATCHES SECTION
// ─────────────────────────────────────────────

function BestDJMatches({ allCompanies }) {
  const ranked = useMemo(() => {
    return [...allCompanies]
      .map((c) => ({ ...c, dj: calculateDJMatch(c) }))
      .sort((a, b) => b.dj.score - a.dj.score)
      .slice(0, 5);
  }, [allCompanies]);

  return (
    <div className="grc-best-matches">
      <div className="grc-section-heading">
        <h2>🏆 Best Robotics Companies for DJ Skills</h2>
        <p className="grc-disclaimer">
          DJ Match Score represents technical skill overlap only. It does not represent hiring probability, company ranking, or job availability.
        </p>
      </div>
      <div className="grc-best-match-list">
        {ranked.map((c, i) => (
          <div key={c.id} className="grc-best-match-item">
            <span className="grc-rank">#{i + 1}</span>
            <span style={{ fontSize: '1.2rem' }}>{c.flag}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#a0a0a0' }}>{c.country}</div>
            </div>
            <DJMatchBadge score={c.dj.score} label={c.dj.label} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────

const GlobalRoboticsCompanies = () => {
  const enriched = useMemo(() => getCompaniesWithScores(), []);

  // ── State ───────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState(ALL);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState(ALL);
  const [filterSkill, setFilterSkill] = useState(ALL);
  const [filterDJ, setFilterDJ] = useState(ALL);
  const [detailCompany, setDetailCompany] = useState(null);
  const [compareSelected, setCompareSelected] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const searchRef = useRef(null);

  // ── Country company counts ──────────────────
  const countryCompanyCounts = useMemo(() => {
    const counts = {};
    companies.forEach((c) => {
      counts[c.countryId] = (counts[c.countryId] || 0) + 1;
    });
    return counts;
  }, []);

  // ── Active country object ───────────────────
  const activeCountry = useMemo(
    () => countries.find((c) => c.id === selectedCountry) || null,
    [selectedCountry]
  );

  // ── Filtered companies ──────────────────────
  const filteredCompanies = useMemo(() => {
    const q = search.toLowerCase().trim();

    return enriched.filter((c) => {
      // Country filter
      if (selectedCountry !== ALL && c.countryId !== selectedCountry) return false;

      // Category filter (partial match)
      if (filterCategory !== ALL) {
        const catMatch = c.category.toLowerCase().includes(filterCategory.toLowerCase())
          || c.focusAreas.some((f) => f.toLowerCase().includes(filterCategory.toLowerCase()));
        if (!catMatch) return false;
      }

      // Skill filter
      if (filterSkill !== ALL) {
        const skillMatch = c.relevantSkills.some((s) =>
          s.toLowerCase().includes(filterSkill.toLowerCase())
        );
        if (!skillMatch) return false;
      }

      // DJ filter
      if (filterDJ !== ALL) {
        const dj = calculateDJMatch(c);
        if (filterDJ === 'HIGH_MATCH' && dj.score < 60) return false;
        if (filterDJ === 'ROS2' && !dj.matchedTerms.some((t) => t === 'ROS 2' || t === 'ROS2')) return false;
        if (filterDJ === 'NAV2' && !dj.matchedTerms.includes('Nav2')) return false;
        if (filterDJ === 'PHYSICAL_AI' && !dj.matchedTerms.includes('Physical AI')) return false;
      }

      // Search query
      if (q) {
        const blob = [
          c.name,
          c.country,
          c.countryCode,
          c.category,
          c.description,
          ...c.focusAreas,
          ...c.relevantSkills,
          ...c.roboticsPlatforms,
          ...c.djRelevantAreas,
        ]
          .join(' ')
          .toLowerCase();
        if (!blob.includes(q)) return false;
      }

      return true;
    });
  }, [enriched, selectedCountry, search, filterCategory, filterSkill, filterDJ]);

  // ── Compare helpers ─────────────────────────
  const toggleCompare = useCallback((id) => {
    setCompareSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }, []);

  const clearFilters = () => {
    setSelectedCountry(ALL);
    setSearch('');
    setFilterCategory(ALL);
    setFilterSkill(ALL);
    setFilterDJ(ALL);
    if (searchRef.current) searchRef.current.focus();
  };

  const hasFilters =
    selectedCountry !== ALL ||
    search !== '' ||
    filterCategory !== ALL ||
    filterSkill !== ALL ||
    filterDJ !== ALL;

  // ─────────────────────────────────────────────
  return (
    <div className="dashboard-page page-container grc-page">

      {/* ── PAGE HEADER ── */}
      <div className="dashboard-hero-banner glass grc-hero-banner">
        <div className="hero-badge">ROBOTICS INDUSTRY INTELLIGENCE</div>
        <h1 className="hero-title">Global Robotics Companies</h1>
        <p className="hero-subtitle">
          Explore leading Robotics, Artificial Intelligence, Physical AI, Autonomous Systems, and Industrial
          Automation companies across the world.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', maxWidth: '750px' }}>
          Discover companies building the future of intelligent robots, humanoids, autonomous mobile robots,
          warehouse automation, and industrial robotics.
        </p>
      </div>

      {/* ── COUNTRY SELECTOR ── */}
      <div className="grc-section-heading" style={{ marginTop: '2rem' }}>
        <h2>Select a Country</h2>
        <p className="grc-muted">Click a country to filter and explore its robotics ecosystem.</p>
      </div>

      <div className="grc-country-grid">
        <button
          className={`grc-country-card grc-country-all ${selectedCountry === ALL ? 'grc-country-selected' : ''}`}
          onClick={() => setSelectedCountry(ALL)}
          aria-pressed={selectedCountry === ALL}
        >
          <span className="grc-country-flag">🌐</span>
          <div className="grc-country-info">
            <div className="grc-country-name">All Countries</div>
            <div className="grc-country-count">{companies.length} companies</div>
          </div>
          <p className="grc-country-desc">View all robotics companies across all supported countries.</p>
          {selectedCountry === ALL && <span className="grc-selected-indicator">✓ Selected</span>}
        </button>

        {countries.map((country) => (
          <CountryCard
            key={country.id}
            country={country}
            isSelected={selectedCountry === country.id}
            onSelect={setSelectedCountry}
            companyCount={countryCompanyCounts[country.id] || 0}
          />
        ))}
      </div>

      {/* ── COUNTRY OVERVIEW ── */}
      {activeCountry && <CountryIndustryOverview country={activeCountry} />}

      {/* ── SEARCH + FILTERS ── */}
      <div className="grc-search-filter-bar">
        {/* Search */}
        <div className="grc-search-wrap">
          <span className="grc-search-icon" aria-hidden>🔍</span>
          <input
            ref={searchRef}
            type="search"
            className="global-search-input grc-search-input"
            placeholder="Search robotics companies, skills, technologies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search robotics companies"
          />
          {search && (
            <button
              className="grc-clear-search"
              onClick={() => setSearch('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="grc-filter-row">
          <div className="grc-filter-group">
            <label className="grc-filter-label" htmlFor="filter-country">Country</label>
            <select
              id="filter-country"
              className="project-dropdown grc-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <option value={ALL}>All Countries</option>
              {countries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grc-filter-group">
            <label className="grc-filter-label" htmlFor="filter-category">Category</label>
            <select
              id="filter-category"
              className="project-dropdown grc-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o} value={o}>{o === ALL ? 'All Categories' : o}</option>
              ))}
            </select>
          </div>

          <div className="grc-filter-group">
            <label className="grc-filter-label" htmlFor="filter-skill">Skill</label>
            <select
              id="filter-skill"
              className="project-dropdown grc-select"
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
            >
              {SKILL_OPTIONS.map((o) => (
                <option key={o} value={o}>{o === ALL ? 'All Skills' : o}</option>
              ))}
            </select>
          </div>

          <div className="grc-filter-group">
            <label className="grc-filter-label" htmlFor="filter-dj">DJ Match</label>
            <select
              id="filter-dj"
              className="project-dropdown grc-select"
              value={filterDJ}
              onChange={(e) => setFilterDJ(e.target.value)}
            >
              {DJ_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <button className="grc-btn grc-btn-ghost" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── RESULTS HEADER ── */}
      <div className="grc-results-header">
        <h2 className="grc-results-title">
          {activeCountry
            ? `Top Robotics Companies in ${activeCountry.name}`
            : 'All Robotics Companies'}
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span className="grc-muted" style={{ fontSize: '0.85rem' }}>
            {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'} found
          </span>
          {compareSelected.length > 0 && (
            <button
              className="grc-btn grc-btn-accent"
              onClick={() => setShowCompare(true)}
              disabled={compareSelected.length < 2}
            >
              ⚖️ Compare ({compareSelected.length}) {compareSelected.length < 2 ? '— select 2 more' : ''}
            </button>
          )}
          {compareSelected.length > 0 && (
            <button className="grc-btn grc-btn-ghost" onClick={() => setCompareSelected([])}>
              Clear Compare
            </button>
          )}
        </div>
      </div>

      {/* ── COMPANY GRID ── */}
      {filteredCompanies.length > 0 ? (
        <div className="grc-company-grid">
          {filteredCompanies.map((company) => (
            <RoboticsCompanyCard
              key={company.id}
              company={company}
              onViewDetails={setDetailCompany}
              compareSelected={compareSelected}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      ) : (
        <div className="grc-empty-state">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            No robotics companies match your current search and filters.
          </h3>
          <p className="grc-muted" style={{ marginBottom: '1.5rem' }}>
            Try adjusting your search terms or filters.
          </p>
          <button className="grc-btn grc-btn-primary" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      )}

      {/* ── BEST DJ MATCHES ── */}
      <BestDJMatches allCompanies={companies} />

      {/* ── MODALS ── */}
      {detailCompany && (
        <CompanyDetailsModal company={detailCompany} onClose={() => setDetailCompany(null)} />
      )}

      {showCompare && compareSelected.length >= 2 && (
        <CompanyComparisonModal
          selected={compareSelected}
          allCompanies={companies}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
};

export default GlobalRoboticsCompanies;
