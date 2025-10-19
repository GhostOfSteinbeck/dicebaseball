import React from 'react';

// ============================================================================
// TRAITS
// ============================================================================

export const POSITION_TRAITS = [
  { id: 'clutch', name: 'Clutch Gene', desc: '+3 hitting in high-pressure moments' },
  { id: 'streaky', name: 'Streaky', desc: 'Hot/cold streaks are more extreme' },
  { id: 'contact', name: 'Contact Wizard', desc: 'Easier to get singles' },
  { id: 'power', name: 'Power Surge', desc: 'Home runs come easier' },
  { id: 'lateBloom', name: 'Late Bloomer', desc: 'Stats cost less XP to upgrade' }
];

export const PITCHER_TRAITS = [
  { id: 'ace', name: 'Ace Material' },
  { id: 'workhorse', name: 'Workhorse' },
  { id: 'clutch', name: 'Clutch Gene' },
  { id: 'strikeout', name: 'Strikeout Artist' }
];

// ============================================================================
// STORY MOMENTS
// ============================================================================

export const STORY_MOMENTS = {
  good: [
    "Coach: 'Keep that up and you'll be moving up soon.'",
    "Teammate: 'That swing was pure poetry.'",
    "Local paper: 'Rising star shines in latest outing'",
    "Scout in stands takes notes after your performance.",
    "Veteran player: 'You remind me of myself at your age.'",
    "Coach: 'The front office is asking about you.'"
  ],
  bad: [
    "Coach: 'Shake it off. Tomorrow's a new day.'",
    "You sit alone in the dugout after the game.",
    "Teammate: 'We all have rough nights.'",
    "Long bus ride back. You stare out the window.",
    "Coach: 'Get some extra batting practice in.'",
    "The doubts creep in. Can you make it?"
  ],
  neutral: [
    "Another day at the ballpark.",
    "The grind continues. One game at a time.",
    "Bus ride to the next town.",
    "You grab dinner with teammates after the game.",
    "Maintenance day. Light practice, lots of rest.",
    "You call home. They ask how it's going."
  ]
};

// ============================================================================
// TEAM CONFIGS WITH LOGOS
// ============================================================================

export const TEAM_CONFIGS = [
  {
    name: 'Monarchs',
    city: 'Crown City',
    colors: ['#1E3A8A', '#FBBF24'],
    logo: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill={color} stroke="#000" strokeWidth="3"/>
        <path d="M 50 20 L 55 35 L 70 35 L 58 45 L 63 60 L 50 50 L 37 60 L 42 45 L 30 35 L 45 35 Z" fill="#FBBF24" stroke="#000" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    name: 'Grays',
    city: 'Steel Harbor',
    colors: ['#4B5563', '#E5E7EB'],
    logo: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="10" y="10" width="80" height="80" fill={color} stroke="#000" strokeWidth="3"/>
        <text x="50" y="70" textAnchor="middle" fontSize="56" fontWeight="bold" fill="#E5E7EB" fontFamily="serif">G</text>
      </svg>
    )
  },
  {
    name: 'Eagles',
    city: 'Summit Peak',
    colors: ['#92400E', '#FCD34D'],
    logo: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <ellipse cx="50" cy="50" rx="45" ry="48" fill={color} stroke="#000" strokeWidth="3"/>
        <path d="M 35 45 Q 40 35 50 38 Q 60 35 65 45 Q 60 50 50 48 Q 40 50 35 45" fill="#FCD34D" stroke="#000" strokeWidth="1.5"/>
        <circle cx="42" cy="42" r="3" fill="#000"/>
        <circle cx="58" cy="42" r="3" fill="#000"/>
        <path d="M 45 55 L 50 60 L 55 55" stroke="#000" strokeWidth="2" fill="none"/>
      </svg>
    )
  },
  {
    name: 'Aces',
    city: 'Riverside',
    colors: ['#DC2626', '#1F2937'],
    logo: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="10" y="10" width="80" height="80" rx="8" fill={color} stroke="#000" strokeWidth="3"/>
        <path d="M 30 50 L 50 25 L 70 50 L 50 70 Z" fill="#DC2626" stroke="#000" strokeWidth="2"/>
        <text x="50" y="60" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#FFF">A</text>
      </svg>
    )
  },
  {
    name: 'Clippers',
    city: 'Harbor Bay',
    colors: ['#0C4A6E', '#FFF'],
    logo: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill={color} stroke="#000" strokeWidth="3"/>
        <path d="M 35 60 Q 50 40 65 60 L 60 55 Q 50 50 40 55 Z" fill="#FFF" stroke="#000" strokeWidth="2"/>
        <line x1="50" y1="30" x2="50" y2="50" stroke="#FFF" strokeWidth="3"/>
      </svg>
    )
  },
  {
    name: 'Smokies',
    city: 'Mill Town',
    colors: ['#374151', '#F59E0B'],
    logo: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="10" y="10" width="80" height="80" fill={color} stroke="#000" strokeWidth="3"/>
        <rect x="30" y="50" width="15" height="30" fill="#F59E0B" stroke="#000" strokeWidth="2"/>
        <rect x="55" y="50" width="15" height="30" fill="#F59E0B" stroke="#000" strokeWidth="2"/>
        <path d="M 35 45 Q 37 35 40 45" stroke="#666" strokeWidth="2" fill="none"/>
        <path d="M 60 45 Q 62 35 65 45" stroke="#666" strokeWidth="2" fill="none"/>
      </svg>
    )
  },
  {
    name: 'Stars',
    city: 'Gateway',
    colors: ['#581C87', '#FDE047'],
    logo: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill={color} stroke="#000" strokeWidth="3"/>
        <path d="M 50 20 L 55 40 L 75 40 L 60 52 L 67 72 L 50 60 L 33 72 L 40 52 L 25 40 L 45 40 Z" fill="#FDE047" stroke="#000" strokeWidth="2"/>
      </svg>
    )
  },
  {
    name: 'Barons',
    city: 'Founders Bay',
    colors: ['#991B1B', '#F59E0B'],
    logo: (color) => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="10" y="10" width="80" height="80" fill={color} stroke="#000" strokeWidth="3"/>
        <path d="M 30 30 L 50 20 L 70 30 L 70 50 L 50 60 L 30 50 Z" fill="#F59E0B" stroke="#000" strokeWidth="2"/>
        <text x="50" y="50" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#991B1B">B</text>
      </svg>
    )
  }
];