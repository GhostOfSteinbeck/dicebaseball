import React from 'react';

// ============================================================================
// BASEBALL CARD COMPONENTS
// ============================================================================

export const BaseballCard = ({ player, teamColors, onClick, showCareerStats = false }) => {
  const generateFace = (seed) => {
    const eyeOptions = ['I', '-', 'o', '•'];
    const mouthOptions = ['.', '-', '⌣', '◡'];
    const eyes = eyeOptions[seed % eyeOptions.length];
    const mouth = mouthOptions[Math.floor(seed / eyeOptions.length) % mouthOptions.length];
    return { eyes, mouth };
  };
  
  const face = generateFace(player.name.length);
  const avg = showCareerStats && player.careerStats 
    ? (player.careerStats.atBats > 0 ? (player.careerStats.hits / player.careerStats.atBats).toFixed(3) : '.000')
    : null;
  
  return (
    <div 
      onClick={onClick}
      className={`bg-stone-100 border-4 border-stone-700 overflow-hidden ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
    >
      {/* Header */}
      <div 
        className="p-2 text-white text-center border-b-4 border-stone-700"
        style={{ backgroundColor: teamColors[0] }}
      >
        <div className="text-xs tracking-widest">{player.team?.toUpperCase() || 'FREE AGENT'}</div>
        <div className="text-lg font-bold">{player.name.toUpperCase()}</div>
        {player.trait && (
          <div className="text-xs text-amber-200">⭐ {player.trait.name}</div>
        )}
      </div>
      
      {/* Portrait */}
      <div className="bg-amber-50 p-4 flex justify-center">
        <svg width="80" height="100" viewBox="0 0 80 100">
          {/* Baseball Cap */}
          <ellipse cx="40" cy="30" rx="30" ry="20" fill={teamColors[0]} stroke="#000" strokeWidth="2"/>
          <path d="M 10 30 Q 40 38 70 30" fill={teamColors[0]} stroke="#000" strokeWidth="2"/>
          <path d="M 15 32 Q 40 40 65 32" fill="none" stroke="#000" strokeWidth="2"/>
          
          {/* Face */}
          <ellipse cx="40" cy="60" rx="25" ry="30" fill="#F5DEB3" stroke="#000" strokeWidth="2"/>
          <text x="30" y="60" fontSize="12" fontWeight="bold">{face.eyes}</text>
          <text x="48" y="60" fontSize="12" fontWeight="bold">{face.eyes}</text>
          <text x="40" y="75" textAnchor="middle" fontSize="14">{face.mouth}</text>
        </svg>
      </div>
      
      {/* Stats */}
      <div className="p-3">
        {player.type === 'position' ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-amber-50 border-2 border-stone-700">
              <div className="text-xs">HIT</div>
              <div className="text-xl font-bold">{player.stats?.hitting || player.hitting}</div>
            </div>
            <div className="text-center p-2 bg-amber-50 border-2 border-stone-700">
              <div className="text-xs">POW</div>
              <div className="text-xl font-bold">{player.stats?.power || player.power}</div>
            </div>
            <div className="text-center p-2 bg-amber-50 border-2 border-stone-700">
              <div className="text-xs">SPD</div>
              <div className="text-xl font-bold">{player.stats?.speed || player.speed}</div>
            </div>
            <div className="text-center p-2 bg-amber-50 border-2 border-stone-700">
              <div className="text-xs">DEF</div>
              <div className="text-xl font-bold">{player.stats?.defense || player.defense}</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-amber-50 border-2 border-stone-700">
              <div className="text-xs">PITCH</div>
              <div className="text-xl font-bold">{player.stats?.pitching || player.pitching}</div>
            </div>
            <div className="text-center p-2 bg-amber-50 border-2 border-stone-700">
              <div className="text-xs">DEF</div>
              <div className="text-xl font-bold">{player.stats?.defense || player.defense}</div>
            </div>
          </div>
        )}
        
        {showCareerStats && avg && (
          <div className="mt-2 p-2 bg-green-100 border-2 border-green-700 text-center">
            <div className="text-xs">CAREER AVG</div>
            <div className="text-lg font-bold">{avg}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// AT BAT RESULT
// ============================================================================

export const AtBatResult = ({ result, onContinue }) => {
  if (!result) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-stone-700 text-amber-100 p-6 border-4 border-amber-900 max-w-md w-full">
        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="text-center">
            <div className="text-xs mb-1">BATTER</div>
            <div className="text-5xl font-bold">{result.batterRoll}</div>
            <div className="text-sm mt-1">+{result.batterMod} = {result.batterRoll + result.batterMod}</div>
          </div>
          <div className="text-center">
            <div className="text-xs mb-1">PITCHER</div>
            <div className="text-5xl font-bold">{result.pitcherRoll}</div>
            <div className="text-sm mt-1">+{result.pitcherMod} = {result.pitcherRoll + result.pitcherMod}</div>
          </div>
        </div>
        
        <div className="text-center border-t-2 border-amber-600 pt-4">
          <div className="text-2xl font-bold mb-2">{result.outcome || result.result}</div>
          {result.earnedXP > 0 && (
            <div className="text-lg text-green-300">+{result.earnedXP} XP</div>
          )}
        </div>
        
        <button
          onClick={onContinue}
          className="w-full mt-4 py-3 text-lg font-bold bg-green-700 text-amber-50 border-4 border-amber-900 hover:bg-green-800"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// BASEBALL DIAMOND
// ============================================================================

export const BaseballDiamond = ({ bases, outs }) => (
  <div className="relative w-64 h-64 mx-auto my-4">
    <div className="absolute inset-0 rotate-45 bg-green-700 border-4 border-amber-900">
      {/* Bases */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rotate-45 border-4 border-amber-900 ${
        bases && bases[1] ? 'bg-red-600' : 'bg-stone-100'
      }`}></div>
      <div className={`absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-12 h-12 rotate-45 border-4 border-amber-900 ${
        bases && bases[0] ? 'bg-red-600' : 'bg-stone-100'
      }`}></div>
      <div className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rotate-45 border-4 border-amber-900 ${
        bases && bases[2] ? 'bg-red-600' : 'bg-stone-100'
      }`}></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-14 h-2 bg-stone-100 border-2 border-amber-900"></div>
      
      {/* Outs display */}
      {outs !== undefined && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-stone-800 text-amber-100 px-4 py-2 border-2 border-amber-900 rounded -rotate-45">
            <div className="text-xs">OUTS</div>
            <div className="text-2xl font-bold">{outs}</div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// ============================================================================
// SCOREBOARD
// ============================================================================

export const Scoreboard = ({ score, inning, outs }) => (
  <div className="bg-stone-800 text-amber-100 p-4 border-4 border-amber-900">
    <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-xs mb-1 tracking-wider">VISITORS</div>
        <div className="text-4xl font-bold">{score?.away || 0}</div>
      </div>
      <div>
        <div className="text-xs mb-1 tracking-wider">INNING</div>
        <div className="text-4xl font-bold">{inning || 1}</div>
      </div>
      <div>
        <div className="text-xs mb-1 tracking-wider">OUTS</div>
        <div className="text-4xl font-bold">{outs || 0}</div>
      </div>
    </div>
  </div>
);

// ============================================================================
// STADIUM BACKDROP
// ============================================================================

export const StadiumBackdrop = ({ teamColors, teamName, record }) => (
  <div className="relative overflow-hidden border-8 border-double border-amber-950 mb-6">
    <svg viewBox="0 0 800 400" className="w-full">
      {/* Sky */}
      <rect x="0" y="0" width="800" height="200" fill="#87CEEB"/>
      
      {/* Outfield Wall */}
      <rect x="0" y="200" width="800" height="60" fill={teamColors[0]}/>
      <line x1="0" y1="200" x2="800" y2="200" stroke="#000" strokeWidth="4"/>
      <line x1="0" y1="260" x2="800" y2="260" stroke="#000" strokeWidth="4"/>
      
      {/* Padding rectangles */}
      {[50, 150, 250, 350, 450, 550, 650, 730].map((x, i) => (
        <rect key={i} x={x} y="215" width="20" height="30" fill="#F59E0B"/>
      ))}
      
      {/* Field */}
      <rect x="0" y="260" width="800" height="140" fill="#2D5016"/>
      
      {/* Infield dirt */}
      <ellipse cx="400" cy="340" rx="150" ry="55" fill="#8B7355"/>
      
      {/* Pitcher's mound */}
      <ellipse cx="400" cy="335" rx="20" ry="12" fill="#A0826D" stroke="#6B5345" strokeWidth="2"/>
      
      {/* Home plate */}
      <path d="M 385 375 L 400 382 L 415 375 L 415 368 L 385 368 Z" fill="#F5F5DC" stroke="#000" strokeWidth="2"/>
      
      {/* Foul lines */}
      <line x1="400" y1="378" x2="150" y2="260" stroke="#F5F5DC" strokeWidth="3"/>
      <line x1="400" y1="378" x2="650" y2="260" stroke="#F5F5DC" strokeWidth="3"/>
      
      {/* Team banner */}
      {teamName && (
        <g>
          <rect x="300" y="30" width="200" height="60" fill={teamColors[0]} stroke="#000" strokeWidth="3"/>
          <text x="400" y="65" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#FFF">{teamName}</text>
        </g>
      )}
      
      {/* Record */}
      {record && (
        <g>
          <rect x="650" y="30" width="120" height="40" fill="#000" stroke="#FFF" strokeWidth="2"/>
          <text x="710" y="55" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#FFF">
            {record.wins}-{record.losses}
          </text>
        </g>
      )}
    </svg>
  </div>
);

// ============================================================================
// TEAM BANNER
// ============================================================================

export const TeamBanner = ({ team, showRecord = false }) => (
  <div 
    className="p-6 border-4 border-amber-900 text-center text-white"
    style={{ backgroundColor: team.colors[0] }}
  >
    <div className="text-xs tracking-widest mb-1">{team.city.toUpperCase()}</div>
    <div className="text-4xl font-bold mb-2" style={{ fontFamily: '"Courier New", monospace' }}>
      {team.name.toUpperCase()}
    </div>
    {showRecord && team.record && (
      <div className="text-lg">
        {team.record.wins}-{team.record.losses}
      </div>
    )}
  </div>
);

// ============================================================================
// VINTAGE TICKET BUTTON
// ============================================================================

export const VintageTicket = ({ title, subtitle, icon, onClick, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-6 border-4 border-dashed border-amber-900 text-center transition-all ${
      disabled 
        ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
        : 'bg-amber-100 hover:bg-amber-200 hover:scale-105'
    }`}
  >
    {icon && <div className="text-2xl mb-2">{icon}</div>}
    <div className="text-2xl font-bold mb-1">{title}</div>
    {subtitle && <div className="text-sm text-stone-600">{subtitle}</div>}
  </button>
);

// ============================================================================
// LOCKER ROOM SCENE
// ============================================================================

export const LockerRoomScene = () => (
  <div className="bg-stone-700 border-4 border-amber-900 overflow-hidden">
    <svg viewBox="0 0 800 400" className="w-full">
      {/* Floor */}
      <rect x="0" y="300" width="800" height="100" fill="#8B7355"/>
      <line x1="0" y1="300" x2="800" y2="300" stroke="#6B5345" strokeWidth="3"/>
      
      {/* Back Wall */}
      <rect x="0" y="0" width="800" height="300" fill="#4A4A4A"/>
      
      {/* Lockers */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <g key={i}>
          <rect x={50 + i * 110} y="40" width="90" height="180" fill="#2C3E50" stroke="#1A252F" strokeWidth="2"/>
          <rect x={60 + i * 110} y="50" width="70" height="160" fill="#34495E" stroke="#1A252F" strokeWidth="1"/>
          <circle cx={95 + i * 110} cy="130" r="4" fill="#D4AF37"/>
          <line x1={70 + i * 110} y1="190" x2={120 + i * 110} y2="190" stroke="#1A252F" strokeWidth="1"/>
        </g>
      ))}
      
      {/* Bench */}
      <rect x="50" y="240" width="700" height="20" fill="#8B4513" stroke="#5C2E0C" strokeWidth="2"/>
      <rect x="50" y="260" width="700" height="10" fill="#6B3410"/>
      
      {/* Weight Bench */}
      <rect x="80" y="260" width="120" height="15" fill="#2C3E50" stroke="#1A252F" strokeWidth="2"/>
      <rect x="130" y="245" width="20" height="30" fill="#34495E"/>
      <line x1="60" y1="250" x2="220" y2="250" stroke="#1A252F" strokeWidth="4"/>
      <rect x="55" y="245" width="15" height="10" fill="#1A252F"/>
      <rect x="210" y="245" width="15" height="10" fill="#1A252F"/>
      <circle cx="70" cy="250" r="12" fill="#2C3E50" stroke="#1A252F" strokeWidth="2"/>
      <circle cx="210" cy="250" r="12" fill="#2C3E50" stroke="#1A252F" strokeWidth="2"/>
      
      {/* Teammates */}
      <g>
        <ellipse cx="300" cy="285" rx="15" ry="8" fill="#5C4033"/>
        <rect x="290" y="220" width="20" height="65" fill="#C41E3A" stroke="#8B1929" strokeWidth="1"/>
        <circle cx="300" cy="205" r="12" fill="#D2B48C"/>
        <line x1="290" y1="240" x2="275" y2="260" stroke="#D2B48C" strokeWidth="3"/>
        <line x1="310" y1="240" x2="325" y2="260" stroke="#D2B48C" strokeWidth="3"/>
      </g>
      
      <g>
        <ellipse cx="520" cy="285" rx="15" ry="8" fill="#5C4033"/>
        <rect x="510" y="250" width="20" height="35" fill="#1E3A8A" stroke="#0C1F4A" strokeWidth="1"/>
        <circle cx="520" cy="235" r="12" fill="#D2B48C"/>
        <line x1="510" y1="265" x2="500" y2="285" stroke="#1E3A8A" strokeWidth="3"/>
        <line x1="530" y1="265" x2="540" y2="285" stroke="#1E3A8A" strokeWidth="3"/>
      </g>
      
      {/* Bulletin Board */}
      <rect x="600" y="60" width="150" height="200" fill="#6B5345" stroke="#4A3625" strokeWidth="3"/>
      <rect x="610" y="70" width="130" height="180" fill="#8B7355" stroke="#6B5345" strokeWidth="2"/>
      <text x="675" y="100" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">STANDINGS</text>
      
      {/* Baseball bat */}
      <line x1="750" y1="230" x2="770" y2="295" stroke="#8B4513" strokeWidth="6"/>
      <circle cx="748" cy="225" r="5" fill="#6B3410"/>
    </svg>
  </div>
);