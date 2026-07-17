// ============================================================
// DJ — Global Robotics Companies Data
// Extensible architecture: add new countries/companies here.
// ============================================================

/** @typedef {'HIGH' | 'MODERATE' | 'GENERAL'} SkillMatchLevel */

/**
 * @typedef {Object} RoboticsCountry
 * @property {string} id
 * @property {string} name            - Full official country name
 * @property {string} code            - Short country code (ISO-style)
 * @property {string} flag            - Emoji flag
 * @property {string} shortDesc       - Short industry tagline for country card
 * @property {string} overview        - Longer paragraph for country overview section
 * @property {string[]} industryFocus - Key focus areas for this country
 */

/**
 * @typedef {Object} RoboticsCompany
 * @property {string} id
 * @property {string} name
 * @property {string} countryId       - References RoboticsCountry.id
 * @property {string} country         - Full country name
 * @property {string} countryCode
 * @property {string} flag
 * @property {string} category
 * @property {string} description
 * @property {string[]} focusAreas
 * @property {string[]} roboticsPlatforms
 * @property {string[]} relevantSkills
 * @property {string[]} djRelevantAreas
 * @property {SkillMatchLevel|null} skillMatch - Manual override or null (auto-calculated)
 * @property {string|null} officialWebsite
 * @property {string} learningPathCategory - Key for learning path lookup
 */

// ────────────────────────────────────────────
// COUNTRIES
// ────────────────────────────────────────────

export const countries = [
  {
    id: 'usa',
    name: 'United States of America',
    code: 'USA',
    flag: '🇺🇸',
    shortDesc: 'Humanoid AI, autonomous robotics, warehouse automation, and advanced robot intelligence.',
    overview:
      'The United States robotics ecosystem has a strong presence in humanoid robotics, embodied artificial intelligence, autonomous systems, and AI-driven warehouse automation.',
    industryFocus: [
      'Humanoid Robotics',
      'Embodied AI',
      'Advanced Robot Intelligence',
      'Warehouse Automation',
      'Autonomous Systems',
    ],
  },
  {
    id: 'germany',
    name: 'Germany',
    code: 'DE',
    flag: '🇩🇪',
    shortDesc: 'Industrial robotics, cognitive robotics, manufacturing automation, and Physical AI.',
    overview:
      'Germany has a strong industrial robotics and manufacturing automation ecosystem, with growing development in cognitive robotics and Physical AI.',
    industryFocus: [
      'Industrial Robotics',
      'Cognitive Robotics',
      'Manufacturing Automation',
      'Physical AI',
      'Human-Robot Collaboration',
    ],
  },
  {
    id: 'india',
    name: 'India',
    code: 'IN',
    flag: '🇮🇳',
    shortDesc: 'Warehouse robotics, autonomous mobile robots, social-impact robotics, and industrial automation.',
    overview:
      "India's robotics ecosystem is expanding across warehouse automation, autonomous mobile robots, industrial systems, and robotics designed for real-world social challenges.",
    industryFocus: [
      'Autonomous Mobile Robots',
      'Warehouse Robotics',
      'Industrial Automation',
      'Social-Impact Robotics',
      'AI-Enabled Robotics',
    ],
  },
];

// ────────────────────────────────────────────
// LEARNING PATH CATEGORIES
// ────────────────────────────────────────────

export const learningPaths = {
  amr: [
    'ROS 2',
    'URDF',
    'TF2',
    'LiDAR',
    'SLAM',
    'Nav2',
    'Costmaps',
    'Path Planning',
    'AMR Architecture',
    'Multi-Robot Systems',
  ],
  physicalAI: [
    'Python',
    'PyTorch',
    'Computer Vision',
    'Transformers',
    'Multimodal AI',
    'Vision-Language Models',
    'Robot Learning',
    'Vision-Language-Action Models',
    'Embodied AI',
    'Physical AI',
  ],
  industrial: [
    'C++',
    'Robot Kinematics',
    'Control Systems',
    'URDF',
    'Motion Planning',
    'Robot Manipulation',
    'Computer Vision',
    'Industrial Automation',
  ],
  warehouse: [
    'ROS 2',
    'Python',
    'SLAM',
    'Nav2',
    'Path Planning',
    'Fleet Management',
    'AI Optimization',
    'Multi-Agent Systems',
    'Warehouse Automation',
  ],
  cognitive: [
    'Python',
    'AI',
    'Computer Vision',
    'Sensor Fusion',
    'Robot Learning',
    'C++',
    'Foundation Models',
    'Human-Robot Interaction',
  ],
};

// ────────────────────────────────────────────
// COMPANIES
// ────────────────────────────────────────────

export const companies = [
  // ── USA ──────────────────────────────────
  {
    id: 'boston-dynamics',
    name: 'Boston Dynamics',
    countryId: 'usa',
    country: 'United States of America',
    countryCode: 'USA',
    flag: '🇺🇸',
    category: 'Advanced Mobile Robotics',
    description:
      'Pioneer in dynamic legged robotics. Known for creating highly agile robots capable of navigating complex terrain using autonomous navigation and advanced motion planning.',
    focusAreas: ['Dynamic Robotics', 'Autonomous Navigation', 'Robot Mobility', 'Industrial Inspection'],
    roboticsPlatforms: ['Spot', 'Atlas'],
    relevantSkills: ['C++', 'Python', 'Computer Vision', 'SLAM', 'Autonomous Navigation', 'Motion Planning'],
    djRelevantAreas: ['ROS 2 concepts', 'Navigation architecture', 'Sensor analysis', 'Robot intelligence'],
    skillMatch: null,
    officialWebsite: 'https://bostondynamics.com',
    learningPathCategory: 'amr',
  },
  {
    id: 'figure-ai',
    name: 'Figure AI',
    countryId: 'usa',
    country: 'United States of America',
    countryCode: 'USA',
    flag: '🇺🇸',
    category: 'Humanoid Robotics and Embodied AI',
    description:
      'Developing general-purpose humanoid robots powered by Vision-Language-Action models and Physical AI systems designed for real-world commercial deployment.',
    focusAreas: ['Humanoid Robotics', 'Physical AI', 'Vision-Language-Action Models', 'Robot Intelligence'],
    roboticsPlatforms: ['Figure humanoid platforms', 'Helix AI systems'],
    relevantSkills: ['Python', 'PyTorch', 'Transformers', 'Computer Vision', 'Multimodal AI', 'Robot Learning'],
    djRelevantAreas: ['Physical AI', 'AI Robotics Copilot', 'Robot AI Readiness', 'Perception analysis'],
    skillMatch: null,
    officialWebsite: 'https://figure.ai',
    learningPathCategory: 'physicalAI',
  },
  {
    id: 'agility-robotics',
    name: 'Agility Robotics',
    countryId: 'usa',
    country: 'United States of America',
    countryCode: 'USA',
    flag: '🇺🇸',
    category: 'Industrial Humanoid Robotics',
    description:
      'Building legged humanoid robots for warehouse and logistics environments. Digit is designed to work alongside humans in real industrial settings.',
    focusAreas: ['Humanoid Robots', 'Warehouse Automation', 'Robot Mobility', 'Industrial Automation'],
    roboticsPlatforms: ['Digit'],
    relevantSkills: ['C++', 'Python', 'Robot Kinematics', 'Motion Planning', 'Perception', 'Control Systems'],
    djRelevantAreas: ['Robot action analysis', 'Navigation', 'Robot architecture', 'AI readiness'],
    skillMatch: null,
    officialWebsite: 'https://agilityrobotics.com',
    learningPathCategory: 'physicalAI',
  },
  {
    id: 'symbotic',
    name: 'Symbotic',
    countryId: 'usa',
    country: 'United States of America',
    countryCode: 'USA',
    flag: '🇺🇸',
    category: 'AI Warehouse Robotics',
    description:
      'AI-powered warehouse automation platform using autonomous mobile robots and intelligent software to optimize supply chain operations at scale.',
    focusAreas: ['Warehouse Automation', 'Autonomous Mobile Robots', 'AI Optimization', 'Multi-Robot Systems'],
    roboticsPlatforms: [],
    relevantSkills: ['Python', 'C++', 'AI', 'Path Planning', 'Fleet Management', 'Autonomous Systems'],
    djRelevantAreas: ['Nav2', 'Path planning', 'Multi-robot concepts', 'Navigation analysis'],
    skillMatch: null,
    officialWebsite: 'https://symbotic.com',
    learningPathCategory: 'warehouse',
  },
  {
    id: 'abb-robotics',
    name: 'ABB Robotics',
    countryId: 'usa',
    country: 'United States of America',
    countryCode: 'USA',
    flag: '🇺🇸',
    category: 'Industrial Robotics and Automation',
    description:
      'Global leader in industrial robot arms, collaborative robots, and autonomous mobile robots for factory and logistics automation.',
    focusAreas: [
      'Industrial Robot Arms',
      'Collaborative Robots',
      'Autonomous Mobile Robots',
      'Factory Automation',
    ],
    roboticsPlatforms: [],
    relevantSkills: ['Industrial Robotics', 'C++', 'Control Systems', 'Computer Vision', 'Robot Programming'],
    djRelevantAreas: ['Robot structure', 'Robot control', 'Physical AI architecture'],
    skillMatch: null,
    officialWebsite: 'https://new.abb.com/products/robotics',
    learningPathCategory: 'industrial',
  },

  // ── GERMANY ──────────────────────────────
  {
    id: 'kuka',
    name: 'KUKA',
    countryId: 'germany',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    category: 'Industrial Robotics',
    description:
      'One of the world\'s leading manufacturers of industrial robotic systems. KUKA robots are deployed in automotive, electronics, and smart factory environments.',
    focusAreas: [
      'Industrial Robot Arms',
      'Collaborative Robotics',
      'Manufacturing Automation',
      'Smart Factories',
    ],
    roboticsPlatforms: ['KUKA industrial robot systems', 'LBR iiwa'],
    relevantSkills: ['C++', 'Robot Kinematics', 'Control Systems', 'Industrial Automation', 'Motion Planning'],
    djRelevantAreas: ['URDF', 'Robot joints', 'Kinematic structure', 'Robot control'],
    skillMatch: null,
    officialWebsite: 'https://www.kuka.com',
    learningPathCategory: 'industrial',
  },
  {
    id: 'neura-robotics',
    name: 'NEURA Robotics',
    countryId: 'germany',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    category: 'Cognitive Robotics and Physical AI',
    description:
      'Developing cognitive humanoid robots that combine advanced AI with Physical AI capabilities for close human-robot collaboration in diverse environments.',
    focusAreas: ['Cognitive Robotics', 'Humanoid Robotics', 'Physical AI', 'Human-Robot Collaboration'],
    roboticsPlatforms: ['4NE1', 'MAiRA'],
    relevantSkills: ['AI', 'Computer Vision', 'Robot Learning', 'C++', 'Python', 'Sensor Fusion'],
    djRelevantAreas: ['Physical AI Analyzer', 'Sensor intelligence', 'AI readiness', 'Perception analysis'],
    skillMatch: null,
    officialWebsite: 'https://neura-robotics.com',
    learningPathCategory: 'cognitive',
  },
  {
    id: 'agile-robots',
    name: 'Agile Robots',
    countryId: 'germany',
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    category: 'AI-Powered Robotics',
    description:
      'Bridging AI and robotics to develop intelligent robotic systems capable of dexterous manipulation and adaptive behavior in industrial and research contexts.',
    focusAreas: ['Artificial Intelligence', 'Industrial Robotics', 'Humanoid Robotics', 'Robot Learning'],
    roboticsPlatforms: ['Agile ONE'],
    relevantSkills: ['Machine Learning', 'Computer Vision', 'C++', 'Python', 'Robot Manipulation', 'Foundation Models'],
    djRelevantAreas: ['Physical AI', 'Robot intelligence', 'AI Robotics Copilot', 'Perception'],
    skillMatch: null,
    officialWebsite: 'https://www.agile.robots',
    learningPathCategory: 'cognitive',
  },

  // ── INDIA ────────────────────────────────
  {
    id: 'addverb',
    name: 'Addverb',
    countryId: 'india',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    category: 'Warehouse Robotics and Automation',
    description:
      "India's leading warehouse robotics company, building autonomous mobile robots and fleet management systems to optimize supply chain and logistics operations.",
    focusAreas: ['Autonomous Mobile Robots', 'Warehouse Automation', 'Robot Fleet Systems', 'Supply Chain Robotics'],
    roboticsPlatforms: [],
    relevantSkills: ['ROS 2', 'C++', 'Python', 'SLAM', 'Nav2', 'Path Planning', 'Fleet Management'],
    djRelevantAreas: ['Nav2 Parameters Analyzer', 'TF Tree Analyzer', 'Sensor Analyzer', 'Navigation analysis'],
    skillMatch: 'HIGH',
    officialWebsite: 'https://addverb.com',
    learningPathCategory: 'warehouse',
  },
  {
    id: 'greyorange',
    name: 'GreyOrange',
    countryId: 'india',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    category: 'Warehouse Robotics and Robot Orchestration',
    description:
      'GreyMatter AI platform powers autonomous mobile robots and orchestrates multi-robot fleets to optimize warehouse fulfillment and logistics operations.',
    focusAreas: ['Warehouse Automation', 'Multi-Robot Coordination', 'AI Optimization', 'Robot Orchestration'],
    roboticsPlatforms: [],
    relevantSkills: ['Python', 'AI', 'Multi-Agent Systems', 'Fleet Management', 'Path Planning'],
    djRelevantAreas: ['Navigation', 'Multi-robot systems', 'AI reasoning', 'Robot intelligence'],
    skillMatch: null,
    officialWebsite: 'https://greyorange.com',
    learningPathCategory: 'warehouse',
  },
  {
    id: 'ati-motors',
    name: 'Ati Motors',
    countryId: 'india',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    category: 'Autonomous Industrial Robotics',
    description:
      'Building autonomous mobile robots for factory floor material handling with AI-based navigation and sensor fusion for industrial environments.',
    focusAreas: ['Autonomous Mobile Robots', 'Factory Automation', 'Material Movement', 'AI-Based Robot Orchestration'],
    roboticsPlatforms: [],
    relevantSkills: ['ROS 2', 'C++', 'Python', 'SLAM', 'Autonomous Navigation', 'Sensor Fusion'],
    djRelevantAreas: ['Nav2', 'Costmaps', 'TF Tree', 'Sensors', 'Robot navigation'],
    skillMatch: 'HIGH',
    officialWebsite: 'https://atimotors.com',
    learningPathCategory: 'amr',
  },
  {
    id: 'genrobotics',
    name: 'Genrobotics',
    countryId: 'india',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    category: 'AI and Social-Impact Robotics',
    description:
      'Building robots for social challenges — Bandicoot is a robotic scavenger that replaces manual scavenging for sewer cleaning, protecting human lives through AI and robotics.',
    focusAreas: ['Robotics', 'Artificial Intelligence', 'Social-Impact Technology', 'Autonomous Systems'],
    roboticsPlatforms: ['Bandicoot'],
    relevantSkills: ['Robotics', 'AI', 'Computer Vision', 'Embedded Systems', 'Python', 'C++'],
    djRelevantAreas: ['Robot intelligence', 'Sensor analysis', 'Physical AI', 'Robot architecture'],
    skillMatch: null,
    officialWebsite: 'https://genrobotics.org',
    learningPathCategory: 'amr',
  },
  {
    id: 'svaya-robotics',
    name: 'Svaya Robotics',
    countryId: 'india',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    category: 'Industrial Robotics',
    description:
      'Developing industrial robotic arms and systems for automation in Indian manufacturing, focused on affordable and effective robot manipulation solutions.',
    focusAreas: ['Industrial Automation', 'Robotic Systems', 'Robot Manipulation', 'Manufacturing Robotics'],
    roboticsPlatforms: [],
    relevantSkills: ['C++', 'Robot Kinematics', 'Control Systems', 'Robot Programming'],
    djRelevantAreas: ['URDF', 'Joint analysis', 'Robot structure', 'Robot control'],
    skillMatch: null,
    officialWebsite: null,
    learningPathCategory: 'industrial',
  },
  {
    id: 'unbox-robotics',
    name: 'Unbox Robotics',
    countryId: 'india',
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    category: 'Logistics Robotics',
    description:
      'Specializing in parcel sorting and robotic logistics systems, enabling warehouse automation for e-commerce and logistics companies in India.',
    focusAreas: ['Parcel Sorting', 'Warehouse Automation', 'Robotic Logistics', 'Automation Systems'],
    roboticsPlatforms: [],
    relevantSkills: ['Robotics', 'Python', 'C++', 'AI', 'Automation', 'Path Planning'],
    djRelevantAreas: ['Navigation', 'Robot intelligence', 'AI readiness'],
    skillMatch: null,
    officialWebsite: 'https://unboxrobotics.com',
    learningPathCategory: 'warehouse',
  },
];

// ────────────────────────────────────────────
// DJ SKILL MATCH ENGINE
// ────────────────────────────────────────────

/**
 * Core DJ technology areas with weights.
 * Higher weight = stronger signal for DJ skill relevance.
 */
const DJ_CORE_SKILLS = [
  // Exact core ROS 2 / Nav2 skills — highest weight
  { term: 'ROS 2', weight: 10 },
  { term: 'ROS2', weight: 10 },
  { term: 'Nav2', weight: 10 },
  { term: 'Navigation', weight: 8 },
  { term: 'Path Planning', weight: 8 },
  { term: 'Costmaps', weight: 8 },
  { term: 'TF Tree', weight: 8 },
  { term: 'TF2', weight: 8 },
  { term: 'URDF', weight: 8 },
  { term: 'SLAM', weight: 7 },
  { term: 'Sensors', weight: 6 },
  { term: 'Sensor Fusion', weight: 6 },
  { term: 'Autonomous Navigation', weight: 7 },
  // Physical AI / AI Robotics Copilot — high weight
  { term: 'Physical AI', weight: 9 },
  { term: 'Robot Intelligence', weight: 7 },
  { term: 'Computer Vision', weight: 6 },
  { term: 'AI', weight: 5 },
  { term: 'Artificial Intelligence', weight: 5 },
  // General robotics — moderate weight
  { term: 'Autonomous Robotics', weight: 5 },
  { term: 'Autonomous Mobile Robots', weight: 6 },
  { term: 'Robot Learning', weight: 5 },
  { term: 'Autonomous Systems', weight: 5 },
  { term: 'Fleet Management', weight: 5 },
  { term: 'Multi-Robot Systems', weight: 5 },
  // Programming skills
  { term: 'C++', weight: 4 },
  { term: 'Python', weight: 4 },
  { term: 'PyTorch', weight: 3 },
];

const MAX_POSSIBLE_SCORE = DJ_CORE_SKILLS.reduce((sum, s) => sum + s.weight, 0);

/**
 * Calculates a DJ skill match score (0-100) for a company.
 * Compares company skills, focus areas, and DJ areas against DJ core skill list.
 * Returns { score, matchedTerms, label }
 */
export function calculateDJMatch(company) {
  const companyText = [
    ...company.relevantSkills,
    ...company.focusAreas,
    ...company.djRelevantAreas,
    company.category,
    company.description,
  ]
    .join(' ')
    .toLowerCase();

  let rawScore = 0;
  const matchedTerms = [];

  for (const { term, weight } of DJ_CORE_SKILLS) {
    if (companyText.includes(term.toLowerCase())) {
      rawScore += weight;
      matchedTerms.push(term);
    }
  }

  // Normalize to 0-100
  const score = Math.min(100, Math.round((rawScore / MAX_POSSIBLE_SCORE) * 100));

  let label;
  if (score >= 80) label = 'Excellent DJ Match';
  else if (score >= 60) label = 'High DJ Match';
  else if (score >= 40) label = 'Moderate DJ Match';
  else label = 'General Robotics';

  return { score, matchedTerms, label };
}

/**
 * Returns all companies enriched with their calculated DJ match score.
 */
export function getCompaniesWithScores() {
  return companies.map((c) => {
    const djMatch = calculateDJMatch(c);
    return { ...c, djMatch };
  });
}
