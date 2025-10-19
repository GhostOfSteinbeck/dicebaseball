import React, { useState } from 'react';
import { DiceEngine, GAME_CONFIG } from '../engine/gameEngine';
import { POSITION_TRAITS, STORY_MOMENTS } from '../engine/constants';

const CareerMode = ({ universe, selectedTeam, onExit }) => {
  const [engine] = useState(() => new DiceEngine());
  const [gamePhase, setGamePhase] = useState('create');
  const [player, setPlayer] = useState(null);
  const [majorLeagueStandings, setMajorLeagueStandings] = useState([]);
  
  const [currentSeason, setCurrentSeason] = useState({
    level: 'Single-A',
    gamesPlayed: 0,
    atBats: 0,
    hits: 0,
    doubles: 0,
    triples: 0,
    homeRuns: 0,
    xp: 0,
    currentGame: {
      atBat: 0,
      hits: 0
    },
    recentAtBats: [],
    momentum: null,
    storyMoment: null
  });
  
  const [lastResult, setLastResult] = useState(null);

  const generateStandings = () => {
    setMajorLeagueStandings(universe.getStandings());
  };

  const createProspect = () => {
    const rollStat = () => Math.floor(Math.random() * 20) + 40;
    const trait = POSITION_TRAITS[Math.floor(Math.random() * POSITION_TRAITS.length)];
    
    const newPlayer = {
      name: '',
      hitting: rollStat(),
      power: rollStat(),
      speed: rollStat(),
      defense: rollStat(),
      potential: Math.floor(Math.random() * 30) + 50,
      trait: trait,
      careerHistory: [],
      team: selectedTeam.name
    };
    
    setPlayer(newPlayer);
    generateStandings();
    setGamePhase('create');
  };

  const startCareer = () => {
    if (!player.name.trim()) {
      alert('Give your player a name!');
      return;
    }
    setGamePhase('playing');
  };

  const checkMomentum = (recentABs) => {
    if (recentABs.length < 3) return null;
    
    const last3 = recentABs.slice(-3);
    const last8 = recentABs.slice(-8);
    
    if (last3.every(ab => ab === 'hit')) {
      return 'hot';
    }
    
    if (last8.length === 8 && last8.every(ab => ab === 'out')) {
      return 'cold';
    }
    
    return null;
  };

  const getMomentumBonus = () => {
    if (player.trait.id === 'streaky') {
      if (currentSeason.momentum === 'hot') return 3;
      if (currentSeason.momentum === 'cold') return -2;
    } else {
      if (currentSeason.momentum === 'hot') return 2;
      if (currentSeason.momentum === 'cold') return -1;
    }
    return 0;
  };

  const generateStoryMoment = (gameHits) => {
    let pool = STORY_MOMENTS.neutral;
    if (gameHits >= 3) pool = STORY_MOMENTS.good;
    if (gameHits === 0) pool = STORY_MOMENTS.bad;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const playAtBat = () => {
    const opponentPitching = Math.floor(Math.random() * 20) + 50;
    const opponent = { pitching: opponentPitching };
    
    const momentumBonus = getMomentumBonus();
    const result = engine.resolveAtBat(player, opponent, { momentum: momentumBonus });
    
    const newSeason = { ...currentSeason };
    newSeason.atBats++;
    newSeason.currentGame.atBat++;
    
    let earnedXP = 0;
    
    if (!result.isOut) {
      newSeason.hits++;
      newSeason.currentGame.hits++;
      newSeason.recentAtBats.push('hit');
      
      if (result.hitType === 'single') earnedXP = GAME_CONFIG.xp.single;
      if (result.hitType === 'double') {
        newSeason.doubles++;
        earnedXP = GAME_CONFIG.xp.double;
      }
      if (result.hitType === 'triple') {
        newSeason.triples++;
        earnedXP = GAME_CONFIG.xp.triple;
      }
      if (result.hitType === 'homerun') {
        newSeason.homeRuns++;
        earnedXP = GAME_CONFIG.xp.homerun;
      }
    } else {
      newSeason.recentAtBats.push('out');
    }
    
    if (newSeason.recentAtBats.length > 8) {
      newSeason.recentAtBats.shift();
    }
    
    newSeason.momentum = checkMomentum(newSeason.recentAtBats);
    newSeason.xp += earnedXP;
    
    setCurrentSeason(newSeason);
    setLastResult({ ...result, earnedXP });
  };

  const endGame = () => {
    const newSeason = { ...currentSeason };
    newSeason.gamesPlayed++;
    
    newSeason.storyMoment = generateStoryMoment(newSeason.currentGame.hits);
    
    newSeason.currentGame = { atBat: 0, hits: 0 };
    setCurrentSeason(newSeason);
    setLastResult(null);
    
    if (newSeason.gamesPlayed >= GAME_CONFIG.career.gamesPerSeason) {
      endSeason();
    } else if (newSeason.gamesPlayed % GAME_CONFIG.career.lockerRoomInterval === 0) {
      setGamePhase('locker-room');
    }
  };

  const endSeason = () => {
    const avg = currentSeason.atBats > 0 ? (currentSeason.hits / currentSeason.atBats).toFixed(3) : '.000';
    
    const seasonRecord = {
      level: currentSeason.level,
      games: currentSeason.gamesPlayed,
      avg: avg,
      hrs: currentSeason.homeRuns
    };
    
    const newPlayer = { ...player };
    newPlayer.careerHistory.push(seasonRecord);
    setPlayer(newPlayer);
    
    setGamePhase('season-end');
  };

  const upgradeStat = (statName) => {
    const cost = player.trait.id === 'lateBloom' ? GAME_CONFIG.xp.lateBloomCost : GAME_CONFIG.xp.upgradeCost;
    
    if (currentSeason.xp < cost) {
      alert(`Need ${cost} XP to upgrade!`);
      return;
    }
    
    const newPlayer = { ...player };
    newPlayer[statName]++;
    setPlayer(newPlayer);
    
    const newSeason = { ...currentSeason };
    newSeason.xp -= cost;
    setCurrentSeason(newSeason);
  };

  const continueFromLockerRoom = () => {
    setGamePhase('playing');
  };

  const advanceLevel = () => {
    const avg = currentSeason.hits / currentSeason.atBats;
    const shouldPromote = avg >= 0.250;
    
    if (shouldPromote) {
      if (currentSeason.level === 'Single-A') {
        startNewSeason('Double-A');
      } else if (currentSeason.level === 'Double-A') {
        startNewSeason('Triple-A');
      } else if (currentSeason.level === 'Triple-A') {
        setGamePhase('graduated');
      }
    } else {
      startNewSeason(currentSeason.level);
    }
  };

  const startNewSeason = (level) => {
    setCurrentSeason({
      level: level,
      gamesPlayed: 0,
      atBats: 0,
      hits: 0,
      doubles: 0,
      triples: 0,
      homeRuns: 0,
      xp: currentSeason.xp,
      currentGame: { atBat: 0, hits: 0 },
      recentAtBats: [],
      momentum: null,
      storyMoment: null
    });
    generateStandings();
    setGamePhase('playing');
  };

  const getAvg = () => {
    if (currentSeason.atBats === 0) return '.000';
    return (currentSeason.hits / currentSeason.atBats).toFixed(3);
  };

  // CREATE SCREEN
  if (gamePhase === 'create' && !player) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-amber-900 text-amber-50 p-6 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-4xl font-bold text-center">CAREER MODE</h1>
            <p className="text-center text-amber-200 text-sm mt-2">Create Your Prospect</p>
          </div>
          
          <button
            onClick={createProspect}
            className="w-full py-6 text-2xl font-bold bg-red-700 text-amber-50 border-4 border-amber-900 hover:bg-red-800"
          >
            ROLL NEW PROSPECT
          </button>
          
          <button
            onClick={onExit}
            className="w-full mt-4 py-4 text-lg font-bold bg-stone-600 text-amber-50 border-4 border-amber-900 hover:bg-stone-700"
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

  // PROSPECT CREATION
  if (gamePhase === 'create' && player) {
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-900 text-amber-50 p-6 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-4xl font-bold text-center">YOUR PROSPECT</h1>
          </div>

          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-4">
            <label className="block text-sm font-bold mb-2">PLAYER NAME:</label>
            <input
              type="text"
              value={player.name}
              onChange={(e) => setPlayer({...player, name: e.target.value})}
              className="w-full p-3 text-xl border-2 border-amber-700"
              placeholder="Enter name..."
            />
          </div>

          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-4">
            <h3 className="text-xl font-bold mb-4 text-center">STATS</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-amber-700 p-3 text-center">
                <div className="text-xs mb-1">HITTING</div>
                <div className="text-3xl font-bold">{player.hitting}</div>
              </div>
              <div className="border-2 border-amber-700 p-3 text-center">
                <div className="text-xs mb-1">POWER</div>
                <div className="text-3xl font-bold">{player.power}</div>
              </div>
              <div className="border-2 border-amber-700 p-3 text-center">
                <div className="text-xs mb-1">SPEED</div>
                <div className="text-3xl font-bold">{player.speed}</div>
              </div>
              <div className="border-2 border-amber-700 p-3 text-center">
                <div className="text-xs mb-1">DEFENSE</div>
                <div className="text-3xl font-bold">{player.defense}</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-200 border-2 border-amber-700 text-center">
              <div className="text-xs mb-1">POTENTIAL</div>
              <div className="text-2xl font-bold">{player.potential}</div>
            </div>
          </div>

          <div className="bg-green-100 p-4 border-4 border-green-700 mb-4">
            <div className="text-center">
              <div className="text-sm font-bold mb-1">TRAIT</div>
              <div className="text-lg font-bold">{player.trait.name}</div>
              <div className="text-sm text-stone-600">{player.trait.desc}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={createProspect}
              className="py-4 text-lg font-bold bg-stone-600 text-amber-50 border-4 border-amber-900 hover:bg-stone-700"
            >
              REROLL
            </button>
            <button
              onClick={startCareer}
              className="py-4 text-lg font-bold bg-green-700 text-amber-50 border-4 border-amber-900 hover:bg-green-800"
            >
              START CAREER
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOCKER ROOM - with FULL SVG SCENE
  if (gamePhase === 'locker-room') {
    const upgradeCost = player.trait.id === 'lateBloom' ? GAME_CONFIG.xp.lateBloomCost : GAME_CONFIG.xp.upgradeCost;
    
    return (
      <div className="min-h-screen bg-stone-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-900 text-amber-50 p-4 mb-4 border-8 border-double border-amber-950">
            <h1 className="text-3xl font-bold text-center">LOCKER ROOM</h1>
            <p className="text-center text-amber-200 text-sm mt-1">Time to Train</p>
          </div>

          {/* THE FULL LOCKER ROOM SVG SCENE */}
          <div className="bg-stone-700 border-4 border-amber-900 mb-6 overflow-hidden">
            <svg viewBox="0 0 800 400" className="w-full">
              <rect x="0" y="300" width="800" height="100" fill="#8B7355"/>
              <line x1="0" y1="300" x2="800" y2="300" stroke="#6B5345" strokeWidth="3"/>
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

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-amber-100 p-6 border-4 border-amber-900">
              <h3 className="text-lg font-bold mb-3 text-center">TRAIN ({upgradeCost} XP)</h3>
              <div className="text-center mb-4">
                <div className="text-sm">AVAILABLE XP:</div>
                <div className="text-4xl font-bold">{currentSeason.xp}</div>
              </div>
              
              <div className="space-y-2">
                {['hitting', 'power', 'speed', 'defense'].map(stat => (
                  <button
                    key={stat}
                    onClick={() => upgradeStat(stat)}
                    disabled={currentSeason.xp < upgradeCost}
                    className={`w-full p-3 border-2 border-amber-700 text-left ${
                      currentSeason.xp >= upgradeCost ? 'bg-green-200 hover:bg-green-300' : 'bg-stone-300 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-bold">{stat.toUpperCase()}</div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{player[stat]}</div>
                        <div className="text-xs">→ {player[stat] + 1}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-stone-900 text-amber-100 p-6 border-4 border-amber-900">
              <h3 className="text-lg font-bold mb-3 text-center">STANDINGS</h3>
              <div className="space-y-2">
                {majorLeagueStandings.map((team, idx) => (
                  <div key={idx} className="flex justify-between border-b border-stone-700 pb-2">
                    <span className="text-sm">{idx + 1}. {team.name}</span>
                    <span className="font-bold text-sm">{team.record.wins}-{team.record.losses}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={continueFromLockerRoom}
            className="w-full mt-6 py-5 text-xl font-bold bg-green-700 text-amber-50 border-4 border-amber-900 hover:bg-green-800"
          >
            BACK TO THE FIELD
          </button>
        </div>
      </div>
    );
  }
// SEASON END
if (gamePhase === 'season-end') {
    const avg = getAvg();
    const promoted = parseFloat(avg) >= 0.250;
    
    return (
      <div className="min-h-screen bg-amber-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-900 text-amber-50 p-6 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-4xl font-bold text-center">SEASON COMPLETE</h1>
            <p className="text-center text-amber-200 text-sm mt-2">{currentSeason.level}</p>
          </div>

          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-center">FINAL STATS</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center border-2 border-amber-700 p-3">
                <div className="text-xs">AVG</div>
                <div className="text-3xl font-bold">{avg}</div>
              </div>
              <div className="text-center border-2 border-amber-700 p-3">
                <div className="text-xs">HITS</div>
                <div className="text-3xl font-bold">{currentSeason.hits}</div>
              </div>
              <div className="text-center border-2 border-amber-700 p-3">
                <div className="text-xs">HR</div>
                <div className="text-3xl font-bold">{currentSeason.homeRuns}</div>
              </div>
            </div>
          </div>

          <div className={`p-6 border-4 mb-6 text-center ${promoted ? 'bg-green-100 border-green-700' : 'bg-red-100 border-red-700'}`}>
            <h3 className="text-2xl font-bold mb-2">
              {promoted ? 'PROMOTED!' : 'NOT PROMOTED'}
            </h3>
            <p className="text-sm">
              {promoted ? 'You hit above .250! Moving up!' : 'Need .250 AVG to advance. Try again.'}
            </p>
          </div>

          <button
            onClick={advanceLevel}
            className="w-full py-5 text-xl font-bold bg-green-700 text-amber-50 border-4 border-amber-900 hover:bg-green-800"
          >
            {promoted ? 'ADVANCE' : 'REPEAT SEASON'}
          </button>
        </div>
      </div>
    );
  }

  // GRADUATED
  if (gamePhase === 'graduated') {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-green-800 text-amber-50 p-8 border-8 border-double border-amber-950 text-center">
            <h1 className="text-5xl font-bold mb-4">CONGRATULATIONS!</h1>
            <h2 className="text-3xl mb-6">{player.name}</h2>
            <p className="text-2xl mb-4">Has been promoted to</p>
            <p className="text-4xl font-bold mb-6">THE MAJOR LEAGUES!</p>
            <div className="bg-green-900 p-4 rounded mb-4">
              <div className="text-sm mb-2">⭐ {player.trait.name} ⭐</div>
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div>HIT: {player.hitting}</div>
                <div>POW: {player.power}</div>
                <div>SPD: {player.speed}</div>
                <div>DEF: {player.defense}</div>
              </div>
            </div>
          </div>

          <div className="bg-amber-100 p-6 border-4 border-amber-900 mt-6">
            <h3 className="text-xl font-bold mb-4 text-center">CAREER HISTORY</h3>
            <div className="space-y-2">
              {player.careerHistory.map((season, idx) => (
                <div key={idx} className="border-2 border-amber-700 p-3">
                  <div className="font-bold">{season.level}</div>
                  <div className="text-sm">{season.games} Games | AVG: {season.avg} | HR: {season.hrs}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full mt-6 py-4 text-xl font-bold bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800"
          >
            BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

  // PLAYING
  return (
    <div className="min-h-screen bg-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-amber-900 text-amber-50 p-4 mb-4 border-8 border-double border-amber-950">
          <h1 className="text-3xl font-bold text-center">{player.name}</h1>
          <p className="text-center text-amber-200">{currentSeason.level} | {selectedTeam.city} {selectedTeam.name}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-amber-100 p-4 border-4 border-amber-900 text-center">
            <div className="text-xs mb-1">GAME</div>
            <div className="text-3xl font-bold">{currentSeason.gamesPlayed + 1}</div>
          </div>
          <div className="bg-amber-100 p-4 border-4 border-amber-900 text-center">
            <div className="text-xs mb-1">AVG</div>
            <div className="text-3xl font-bold">{getAvg()}</div>
          </div>
          <div className="bg-amber-100 p-4 border-4 border-amber-900 text-center">
            <div className="text-xs mb-1">XP</div>
            <div className="text-3xl font-bold">{currentSeason.xp}</div>
          </div>
        </div>

        {lastResult && (
          <div className="bg-stone-700 text-amber-100 p-6 border-4 border-amber-900 mb-4">
            <div className="grid grid-cols-2 gap-6 mb-4">
              <div className="text-center">
                <div className="text-xs mb-1">BATTER</div>
                <div className="text-4xl font-bold">{lastResult.batterRoll}</div>
                <div className="text-sm">+{lastResult.batterMod} = {lastResult.batterRoll + lastResult.batterMod}</div>
              </div>
              <div className="text-center">
                <div className="text-xs mb-1">PITCHER</div>
                <div className="text-4xl font-bold">{lastResult.pitcherRoll}</div>
                <div className="text-sm">+{lastResult.pitcherMod} = {lastResult.pitcherRoll + lastResult.pitcherMod}</div>
              </div>
            </div>
            <div className="text-center border-t-2 border-amber-600 pt-3">
              <div className="text-xl font-bold mb-1">{lastResult.outcome}</div>
              {lastResult.earnedXP > 0 && (
                <div className="text-sm text-green-300">+{lastResult.earnedXP} XP</div>
              )}
            </div>
          </div>
        )}

        {currentSeason.storyMoment && (
          <div className="bg-amber-100 p-4 border-4 border-amber-900 mb-4 text-center italic">
            "{currentSeason.storyMoment}"
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={playAtBat}
            disabled={currentSeason.currentGame.atBat >= GAME_CONFIG.career.atBatsPerGame}
            className={`py-6 text-xl font-bold border-4 border-amber-900 ${
              currentSeason.currentGame.atBat >= GAME_CONFIG.career.atBatsPerGame
                ? 'bg-stone-400 text-stone-600 cursor-not-allowed'
                : 'bg-red-700 text-amber-50 hover:bg-red-800'
            }`}
          >
            AT BAT
          </button>
          <button
            onClick={endGame}
            disabled={currentSeason.currentGame.atBat < GAME_CONFIG.career.atBatsPerGame}
            className={`py-6 text-xl font-bold border-4 border-amber-900 ${
              currentSeason.currentGame.atBat < GAME_CONFIG.career.atBatsPerGame
                ? 'bg-stone-400 text-stone-600 cursor-not-allowed'
                : 'bg-green-700 text-amber-50 hover:bg-green-800'
            }`}
          >
            END GAME
          </button>
        </div>

        <div className="bg-amber-100 p-4 border-4 border-amber-900">
          <h3 className="font-bold mb-3 text-center">YOUR STATS</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center border-2 border-amber-700 p-2">
              <div className="text-xs">HIT</div>
              <div className="text-2xl font-bold">{player.hitting}</div>
            </div>
            <div className="text-center border-2 border-amber-700 p-2">
              <div className="text-xs">POW</div>
              <div className="text-2xl font-bold">{player.power}</div>
            </div>
            <div className="text-center border-2 border-amber-700 p-2">
              <div className="text-xs">SPD</div>
              <div className="text-2xl font-bold">{player.speed}</div>
            </div>
            <div className="text-center border-2 border-amber-700 p-2">
              <div className="text-xs">DEF</div>
              <div className="text-2xl font-bold">{player.defense}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerMode;