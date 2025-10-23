import React, { useState, useEffect } from 'react';
import { DiceEngine, GAME_CONFIG } from '../engine/gameEngine';
import { generateName } from '../engine/constants';

const GMMode = ({ selectedTeam, universe, onExit }) => {
  const [engine] = useState(() => new DiceEngine());
  const [view, setView] = useState('hub');
  const [myTeam, setMyTeam] = useState(null);
  const [draftState, setDraftState] = useState(null);
  const [season, setSeason] = useState({ 
    gamesPlayed: 0, 
    totalGames: GAME_CONFIG.gm.seasonGames,
    year: 1
  });
  const [gameResult, setGameResult] = useState(null);
  const [lineup, setLineup] = useState({
    C: null, '1B': null, '2B': null, '3B': null, SS: null,
    LF: null, CF: null, RF: null, DH: null
  });

  // Initialize from universe
  useEffect(() => {
    if (selectedTeam && universe.league) {
      const team = universe.league.find(t => t.name === selectedTeam.name);
      if (team) {
        setMyTeam(team);
      } else {
        console.error('Team not found in universe:', selectedTeam.name);
      }
    }
  }, [selectedTeam, universe]);

  // ============================================================================
  // DRAFT SYSTEM (adds 2 players to roster)
  // ============================================================================

  const generateProspects = () => {
    const prospects = [];
    for (let i = 0; i < 20; i++) {
      const isPosition = i < 14;
      
      if (isPosition) {
        prospects.push({
          id: `prospect-${Date.now()}-${i}`,
          name: generateName(),
          type: 'position',
          stats: {
            hitting: 45 + Math.floor(Math.random() * 30),
            power: 45 + Math.floor(Math.random() * 30),
            speed: 45 + Math.floor(Math.random() * 30),
            defense: 45 + Math.floor(Math.random() * 30)
          }
        });
      } else {
        prospects.push({
          id: `prospect-${Date.now()}-${i}`,
          name: generateName(),
          type: 'pitcher',
          stats: {
            pitching: 45 + Math.floor(Math.random() * 30),
            defense: 45 + Math.floor(Math.random() * 30)
          }
        });
      }
    }
    return prospects;
  };

  const startDraft = () => {
    const prospects = generateProspects();
    const draftOrder = [...universe.league].sort(() => Math.random() - 0.5);
    
    setDraftState({
      prospects,
      draftOrder,
      currentPick: 0,
      round: 1,
      picks: []
    });
  };

  const makePick = (prospect) => {
    const currentTeam = draftState.draftOrder[draftState.currentPick % 8];
    const newPicks = [...draftState.picks, { team: currentTeam.name, player: prospect }];
    const newProspects = draftState.prospects.filter(p => p.id !== prospect.id);
    
    let nextPick = draftState.currentPick + 1;
    let nextRound = nextPick >= 8 ? 2 : 1;
    
    setDraftState({
      ...draftState,
      prospects: newProspects,
      currentPick: nextPick,
      round: nextRound,
      picks: newPicks
    });
    
    // Draft complete - ADD top 3 picks to minor league, rest to roster
    if (nextPick >= 16) {
      // Update universe directly
      universe.league.forEach(team => {
        const teamPicks = newPicks
          .filter(p => p.team === team.name)
          .map(p => p.player);
        
        // Top 3 picks go to minor league, rest go to roster
        const top3Picks = teamPicks.slice(0, 3);
        const remainingPicks = teamPicks.slice(3);
        
        // Validate roster size before adding players
        const currentRosterSize = team.roster.length;
        const maxRosterSize = 14;
        const availableSlots = maxRosterSize - currentRosterSize;
        
        if (availableSlots < remainingPicks.length) {
          console.warn(`Team ${team.name} roster would exceed limit. Only adding ${availableSlots} players to roster.`);
          const validPicks = remainingPicks.slice(0, availableSlots);
          team.roster = [...team.roster, ...validPicks];
        } else {
          team.roster = [...team.roster, ...remainingPicks];
        }
        
        team.minorLeague = [...(team.minorLeague || []), ...top3Picks];
      });
      
      // Update myTeam reference
      setMyTeam(universe.league.find(t => t.name === myTeam.name));
      setView('hub');
    }
  };

  // ============================================================================
  // POSITION ASSIGNMENT
  // ============================================================================

  const assignPosition = (position, player) => {
    const newLineup = { ...lineup };
    Object.keys(newLineup).forEach(pos => {
      if (newLineup[pos]?.id === player.id) {
        newLineup[pos] = null;
      }
    });
    newLineup[position] = player;
    setLineup(newLineup);
  };

  const removeFromPosition = (position) => {
    setLineup({ ...lineup, [position]: null });
  };

  // ============================================================================
  // ENHANCED GAME SIMULATION (with Speed/Defense/Position bonuses)
  // ============================================================================

  const getPositionDefenseBonus = (position) => {
    const bonuses = {
      'C': 3, 'SS': 3, 'CF': 3,  // Premium defense positions
      '2B': 2, '3B': 2, 'RF': 2,  // Medium defense
      '1B': 1, 'LF': 1, 'DH': 0   // Low defense
    };
    return bonuses[position] || 0;
  };

  const calculateTeamStrength = (team, isOffense) => {
    const positionPlayers = team.roster.filter(p => p.type === 'position');
    const pitchers = team.roster.filter(p => p.type === 'pitcher');
    
    if (isOffense) {
      // Offense: hitting + power + speed
      const offenseStats = positionPlayers.reduce((sum, p) => 
        sum + p.stats.hitting + p.stats.power + (p.stats.speed * 0.5), 0
      );
      return offenseStats / positionPlayers.length;
    } else {
      // Defense: team defense + pitcher + position bonuses
      const fieldingDefense = positionPlayers.reduce((sum, p) => sum + p.stats.defense, 0) / positionPlayers.length;
      const pitchingDefense = pitchers.reduce((sum, p) => sum + p.stats.pitching, 0) / pitchers.length;
      
      // Position bonuses (if lineup is set, use those positions)
      let positionBonus = 0;
      if (team.name === myTeam.name) {
        Object.entries(lineup).forEach(([pos, player]) => {
          if (player) positionBonus += getPositionDefenseBonus(pos);
        });
      } else {
        positionBonus = 10; // Average for CPU teams
      }
      
      return (fieldingDefense * 0.3) + (pitchingDefense * 0.6) + positionBonus;
    }
  };

  const runSingleSimulation = (team1, team2) => {
    const team1Offense = calculateTeamStrength(team1, true);
    const team1Defense = calculateTeamStrength(team1, false);
    const team2Offense = calculateTeamStrength(team2, true);
    const team2Defense = calculateTeamStrength(team2, false);
    
    // Score = offense strength - opponent defense + randomness
    const team1Score = Math.max(0, Math.floor(
      (team1Offense - team2Defense) / 15 + Math.random() * 8
    ));
    const team2Score = Math.max(0, Math.floor(
      (team2Offense - team1Defense) / 15 + Math.random() * 8
    ));
    
    return { team1Score, team2Score };
  };

  const simulateGame = () => {
    const opponents = universe.league.filter(t => t.name !== myTeam.name);
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    
    // Run 3 simulations, take most common result
    const sims = [
      runSingleSimulation(myTeam, opponent),
      runSingleSimulation(myTeam, opponent),
      runSingleSimulation(myTeam, opponent)
    ];
    
    // Pick the median result
    sims.sort((a, b) => (a.team1Score + a.team2Score) - (b.team1Score + b.team2Score));
    const result = sims[1];
    
    const yourScore = result.team1Score;
    const oppScore = result.team2Score;
    const won = yourScore > oppScore;
    
    // Update records using universe method
    if (won) {
      universe.recordGame(myTeam.name, opponent.name);
    } else {
      universe.recordGame(opponent.name, myTeam.name);
    }
    
    // Update myTeam reference
    setMyTeam(universe.league.find(t => t.name === myTeam.name));
    
    const newGamesPlayed = season.gamesPlayed + 1;
    
    // Check if season is over
    if (newGamesPlayed >= season.totalGames) {
      setSeason({ gamesPlayed: 0, totalGames: season.totalGames, year: season.year + 1 });
      setGameResult({ opponent: opponent.name, yourScore, oppScore, won, seasonOver: true });
    } else {
      setSeason({ ...season, gamesPlayed: newGamesPlayed });
      setGameResult({ opponent: opponent.name, yourScore, oppScore, won, seasonOver: false });
    }
    
    setView('simulate');
  };

  // ============================================================================
  // END OF SEASON STATS & SALARIES
  // ============================================================================

  const calculateSeasonStats = (player) => {
    const atBats = 80; // 4 AB × 20 games
    const avgPct = (player.stats.hitting / 100);
    const hits = Math.floor(atBats * avgPct);
    const hrRate = (player.stats.power / 100) * 0.15;
    const homeRuns = Math.floor(atBats * hrRate);
    const stolenBases = Math.floor((player.stats.speed / 100) * 20);
    
    return { atBats, hits, homeRuns, stolenBases, avg: (hits / atBats).toFixed(3) };
  };

  const calculateSalary = (player) => {
    if (player.type === 'pitcher') {
      const rating = player.stats.pitching;
      if (rating >= 75) return '$$$$';
      if (rating >= 65) return '$$$';
      if (rating >= 55) return '$$';
      return '$';
    } else {
      const overall = (player.stats.hitting + player.stats.power + player.stats.speed + player.stats.defense) / 4;
      if (overall >= 75) return '$$$$';
      if (overall >= 65) return '$$$';
      if (overall >= 55) return '$$';
      return '$';
    }
  };

  // ============================================================================
  // RENDER: DRAFT SCREEN (DOS Terminal)
  // ============================================================================

  if (view === 'draft') {
    if (!draftState) {
      return (
        <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
          <div className="max-w-4xl mx-auto border-4 border-green-400 p-6">
            <pre className="text-center mb-6 text-xl">
{`╔════════════════════════════════════════╗
║    DRAFT DAY PROTOCOL v1.0 - YEAR ${season.year}   ║
║      [ADD 2 PLAYERS TO ROSTER]         ║
╚════════════════════════════════════════╝`}
            </pre>
            
            <div className="mb-6 text-center">
              <div className="mb-2">SYSTEM: 20 prospects available</div>
              <div className="mb-2">FORMAT: 2 rounds, 8 teams</div>
              <div>OBJECTIVE: Select 2 new players</div>
            </div>
            
            <button
              onClick={startDraft}
              className="w-full py-4 text-xl border-4 border-green-400 bg-black hover:bg-green-400 hover:text-black"
            >
              {'>'} INITIALIZE DRAFT SEQUENCE_
            </button>
          </div>
        </div>
      );
    }

    const currentTeam = draftState.draftOrder[draftState.currentPick % 8];
    const isYourPick = currentTeam.name === myTeam.name;

    return (
      <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
        <div className="max-w-6xl mx-auto">
          <div className="border-4 border-green-400 p-4 mb-4">
            <div className="text-center">
              <div>DRAFT STATUS: ROUND {draftState.round} | PICK {(draftState.currentPick % 8) + 1}</div>
              <div className="text-amber-400 mt-2">
                {isYourPick ? '>>> YOUR SELECTION <<<' : `WAITING: ${currentTeam.name}`}
              </div>
            </div>
          </div>

          {!isYourPick && (
            <div className="text-center mb-4">
              <button
                onClick={() => makePick(draftState.prospects[0])}
                className="px-6 py-2 border-2 border-green-400 hover:bg-green-400 hover:text-black"
              >
                {'>'} SIMULATE CPU PICK_
              </button>
            </div>
          )}

          {isYourPick && (
            <div className="border-4 border-green-400 p-4">
              <div className="mb-4">AVAILABLE PROSPECTS:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                {draftState.prospects.map((prospect) => (
                  <div
                    key={prospect.id}
                    onClick={() => makePick(prospect)}
                    className="border-2 border-green-400 p-3 cursor-pointer hover:bg-green-400 hover:text-black"
                  >
                    <div className="flex justify-between mb-2">
                      <span>{prospect.name}</span>
                      <span>[{prospect.type === 'position' ? 'POS' : 'PIT'}]</span>
                    </div>
                    <div className="text-xs grid grid-cols-4 gap-2">
                      {prospect.type === 'position' ? (
                        <>
                          <div>HIT: {prospect.stats.hitting}</div>
                          <div>POW: {prospect.stats.power}</div>
                          <div>SPD: {prospect.stats.speed}</div>
                          <div>DEF: {prospect.stats.defense}</div>
                        </>
                      ) : (
                        <>
                          <div>PIT: {prospect.stats.pitching}</div>
                          <div>DEF: {prospect.stats.defense}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: LINEUP SCREEN (DOS Terminal)
  // ============================================================================

  if (view === 'lineup') {
    if (!myTeam) {
      return (
        <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
          <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
        </div>
      );
    }
    const positionPlayers = myTeam.roster.filter(p => p.type === 'position');
    const unassigned = positionPlayers.filter(p => 
      !Object.values(lineup).some(assigned => assigned && assigned.id === p.id)
    );
    
    const positions = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];

    return (
      <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
        <div className="max-w-6xl mx-auto">
          
          <div className="border-4 border-green-400 p-4 mb-6">
            <pre className="text-center">
{`╔════════════════════════════════════════╗
║       LINEUP MANAGEMENT SYSTEM         ║
║          [ASSIGN POSITIONS]            ║
╚════════════════════════════════════════╝`}
            </pre>
          </div>

          <div className="grid grid-cols-2 gap-6">
            
            <div className="border-4 border-green-400 p-4">
              <div className="mb-4 text-amber-400">STARTING LINEUP:</div>
              
              {positions.map(pos => (
                <div key={pos} className="border-2 border-green-400 p-2 mb-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold w-12">{pos}</span>
                    {lineup[pos] ? (
                      <div className="flex-1 ml-4 flex justify-between items-center">
                        <span>{lineup[pos].name}</span>
                        <button
                          onClick={() => removeFromPosition(pos)}
                          className="border border-red-500 text-red-500 px-2 hover:bg-red-500 hover:text-black"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-600 ml-4">[EMPTY]</span>
                    )}
                  </div>
                  {lineup[pos] && (
                    <div className="text-xs mt-1 text-gray-400">
                      HIT:{lineup[pos].stats.hitting} POW:{lineup[pos].stats.power} 
                      SPD:{lineup[pos].stats.speed} DEF:{lineup[pos].stats.defense}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-4 border-green-400 p-4">
              <div className="mb-4 text-amber-400">AVAILABLE PLAYERS:</div>
              
              {unassigned.length === 0 ? (
                <div className="text-gray-600">All players assigned</div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {unassigned.map(player => (
                    <div key={player.id} className="border-2 border-green-400 p-2">
                      <div className="font-bold mb-1">{player.name}</div>
                      <div className="text-xs mb-2">
                        HIT:{player.stats.hitting} POW:{player.stats.power} 
                        SPD:{player.stats.speed} DEF:{player.stats.defense}
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1">
                        {positions.map(pos => (
                          <button
                            key={pos}
                            onClick={() => assignPosition(pos, player)}
                            className="border border-green-400 text-xs py-1 hover:bg-green-400 hover:text-black"
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setView('hub')}
            className="w-full mt-6 py-3 border-4 border-green-400 hover:bg-green-400 hover:text-black"
          >
            {'<'} BACK TO HUB_
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: HUB (Stadium Aesthetic)
  // ============================================================================

  // Don't render until myTeam is loaded
  if (!myTeam) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
      </div>
    );
  }

  if (view === 'hub') {
    return (
      <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: '"Courier New", monospace' }}>
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="bg-amber-900 text-amber-50 p-4 mb-4 border-8 border-double border-amber-950">
            <div className="text-center">
              <div className="text-xs tracking-widest">GENERAL MANAGER</div>
              <h1 className="text-4xl font-bold">{myTeam.city.toUpperCase()} {myTeam.name.toUpperCase()}</h1>
              <div className="text-sm text-amber-200 mt-2">
                YEAR {season.year} | GAME {season.gamesPlayed}/{season.totalGames} | {myTeam.record.wins}-{myTeam.record.losses}
              </div>
            </div>
          </div>

          {/* Stadium Visual */}
          <div className="relative overflow-hidden border-8 border-double border-amber-950 mb-6">
            <svg viewBox="0 0 800 400" className="w-full">
              <rect x="0" y="0" width="800" height="200" fill="#87CEEB"/>
              <rect x="0" y="200" width="800" height="60" fill={myTeam.colors[0]}/>
              <line x1="0" y1="200" x2="800" y2="200" stroke="#000" strokeWidth="4"/>
              <line x1="0" y1="260" x2="800" y2="260" stroke="#000" strokeWidth="4"/>
              
              {[50, 150, 250, 350, 450, 550, 650, 730].map((x, i) => (
                <rect key={i} x={x} y="215" width="20" height="30" fill="#F59E0B"/>
              ))}
              
              <rect x="0" y="260" width="800" height="140" fill="#2D5016"/>
              <ellipse cx="400" cy="340" rx="150" ry="55" fill="#8B7355"/>
              <ellipse cx="400" cy="335" rx="20" ry="12" fill="#A0826D" stroke="#6B5345" strokeWidth="2"/>
              
              <path d="M 385 375 L 400 382 L 415 375 L 415 368 L 385 368 Z" fill="#F5F5DC" stroke="#000" strokeWidth="2"/>
              
              <line x1="400" y1="378" x2="150" y2="260" stroke="#F5F5DC" strokeWidth="3"/>
              <line x1="400" y1="378" x2="650" y2="260" stroke="#F5F5DC" strokeWidth="3"/>
              
              <rect x="388" y="288" width="24" height="24" fill="#F5F5DC" stroke="#000" strokeWidth="2" transform="rotate(45 400 300)"/>
              <rect x="458" y="323" width="24" height="24" fill="#F5F5DC" stroke="#000" strokeWidth="2" transform="rotate(45 470 335)"/>
              <rect x="318" y="323" width="24" height="24" fill="#F5F5DC" stroke="#000" strokeWidth="2" transform="rotate(45 330 335)"/>
              
              <rect x="300" y="130" width="200" height="60" fill="#1F2937" stroke="#000" strokeWidth="3"/>
              <rect x="310" y="140" width="80" height="40" fill={myTeam.colors[0]}/>
              <rect x="410" y="140" width="80" height="40" fill="#4B5563"/>
              <text x="350" y="165" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#FFF">{myTeam.record.wins}</text>
              <text x="450" y="165" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#FFF">{myTeam.record.losses}</text>
              <text x="350" y="185" textAnchor="middle" fontSize="8" fill="#FFF">WINS</text>
              <text x="450" y="185" textAnchor="middle" fontSize="8" fill="#FFF">LOSSES</text>
            </svg>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={season.gamesPlayed < season.totalGames ? simulateGame : null}
              disabled={season.gamesPlayed >= season.totalGames}
              className="bg-amber-100 border-4 border-amber-900 p-6 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl font-bold mb-2">PLAY GAME</div>
              <div className="text-sm">
                {season.gamesPlayed < season.totalGames ? 'Simulate next matchup' : 'Season complete'}
              </div>
            </button>

            <button
              onClick={() => setView('lineup')}
              className="bg-amber-100 border-4 border-amber-900 p-6 hover:bg-amber-200"
            >
              <div className="text-2xl font-bold mb-2">SET LINEUP</div>
              <div className="text-sm">Access office computer</div>
            </button>

            <button
              onClick={() => setView('roster')}
              className="bg-amber-100 border-4 border-amber-900 p-6 hover:bg-amber-200"
            >
              <div className="text-2xl font-bold mb-2">VIEW ROSTER</div>
              <div className="text-sm">Check team stats</div>
            </button>

            <button
              onClick={() => setView('standings')}
              className="bg-amber-100 border-4 border-amber-900 p-6 hover:bg-amber-200"
            >
              <div className="text-2xl font-bold mb-2">STANDINGS</div>
              <div className="text-sm">League overview</div>
            </button>

            <button
              onClick={() => setView('minor-league')}
              className="bg-amber-100 border-4 border-amber-900 p-6 hover:bg-amber-200"
            >
              <div className="text-2xl font-bold mb-2">MINOR LEAGUE</div>
              <div className="text-sm">Top prospects ({myTeam.minorLeague?.length || 0})</div>
            </button>
          </div>

          {/* Season over - go to draft or stats */}
          {season.gamesPlayed >= season.totalGames && (
            <div className="bg-green-100 border-4 border-green-700 p-6 text-center mb-4">
              <div className="text-2xl font-bold mb-4">SEASON {season.year} COMPLETE!</div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setView('season-stats')}
                  className="bg-amber-700 text-amber-50 py-4 text-xl font-bold border-4 border-amber-900 hover:bg-amber-800"
                >
                  VIEW SEASON STATS
                </button>
                <button
                  onClick={startDraft}
                  className="bg-amber-700 text-amber-50 py-4 text-xl font-bold border-4 border-amber-900 hover:bg-amber-800"
                >
                  START YEAR {season.year + 1} DRAFT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: ROSTER VIEW (Stadium Aesthetic)
  // ============================================================================

  if (view === 'roster') {
    if (!myTeam) {
      return (
        <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
          <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
        </div>
      );
    }
    const positionPlayers = myTeam.roster.filter(p => p.type === 'position');
    const pitchers = myTeam.roster.filter(p => p.type === 'pitcher');

    return (
      <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: '"Courier New", monospace' }}>
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-amber-900 text-amber-50 p-4 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-3xl font-bold text-center">{myTeam.name.toUpperCase()} ROSTER</h1>
          </div>

          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-4">
            <h2 className="text-2xl font-bold mb-4">POSITION PLAYERS ({positionPlayers.length})</h2>
            <div className="space-y-2">
              {positionPlayers.map((p, idx) => (
                <div key={idx} className="bg-white border-2 border-amber-700 p-3 flex justify-between items-center">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-sm">
                    HIT:{p.stats.hitting} POW:{p.stats.power} SPD:{p.stats.speed} DEF:{p.stats.defense}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-4">
            <h2 className="text-2xl font-bold mb-4">PITCHERS ({pitchers.length})</h2>
            <div className="space-y-2">
              {pitchers.map((p, idx) => (
                <div key={idx} className="bg-white border-2 border-amber-700 p-3 flex justify-between items-center">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-sm">
                    PIT:{p.stats.pitching} DEF:{p.stats.defense}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setView('hub')}
            className="w-full py-4 bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800 text-xl font-bold"
          >
            ← BACK TO HUB
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: STANDINGS (Stadium Aesthetic)
  // ============================================================================

  if (view === 'standings') {
    return (
      <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: '"Courier New", monospace' }}>
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-amber-900 text-amber-50 p-4 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-3xl font-bold text-center">LEAGUE STANDINGS</h1>
            <p className="text-center text-amber-200 text-sm mt-2">Year {season.year}</p>
          </div>

          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-4">
            {[...universe.league].sort((a, b) => b.record.wins - a.record.wins).map((team, idx) => (
              <div 
                key={idx} 
                className={`flex justify-between p-3 mb-2 border-2 ${team.name === myTeam.name ? 'bg-green-100 border-green-700' : 'bg-white border-amber-700'}`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold text-2xl">{idx + 1}</span>
                  <span className="font-bold">{team.city} {team.name}</span>
                </div>
                <span className="text-2xl font-bold">{team.record.wins}-{team.record.losses}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setView('hub')}
            className="w-full py-4 bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800 text-xl font-bold"
          >
            ← BACK TO HUB
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MINOR LEAGUE (Stadium Aesthetic)
  // ============================================================================

  if (view === 'minor-league') {
    if (!myTeam) {
      return (
        <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
          <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
        </div>
      );
    }
    const minorLeaguePlayers = myTeam.minorLeague || [];

    return (
      <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: '"Courier New", monospace' }}>
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-amber-900 text-amber-50 p-4 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-3xl font-bold text-center">{myTeam.name.toUpperCase()} MINOR LEAGUE</h1>
            <p className="text-center text-amber-200 text-sm mt-2">Top 3 Draft Picks Storage</p>
          </div>

          {minorLeaguePlayers.length === 0 ? (
            <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-4 text-center">
              <div className="text-2xl font-bold mb-2">NO PROSPECTS</div>
              <div className="text-sm">Complete a draft to see your top picks here</div>
            </div>
          ) : (
            <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-4">
              <h2 className="text-2xl font-bold mb-4">MINOR LEAGUE PROSPECTS ({minorLeaguePlayers.length})</h2>
              <div className="space-y-3">
                {minorLeaguePlayers.map((player, idx) => (
                  <div key={idx} className="bg-white border-2 border-amber-700 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-lg">{player.name}</div>
                      <div className="text-sm bg-amber-200 px-2 py-1 rounded">
                        {player.type === 'position' ? 'POSITION PLAYER' : 'PITCHER'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      {player.type === 'position' ? (
                        <>
                          <div className="text-center p-2 bg-amber-50 border border-amber-700">
                            <div className="text-xs">HIT</div>
                            <div className="font-bold">{player.stats.hitting}</div>
                          </div>
                          <div className="text-center p-2 bg-amber-50 border border-amber-700">
                            <div className="text-xs">POW</div>
                            <div className="font-bold">{player.stats.power}</div>
                          </div>
                          <div className="text-center p-2 bg-amber-50 border border-amber-700">
                            <div className="text-xs">SPD</div>
                            <div className="font-bold">{player.stats.speed}</div>
                          </div>
                          <div className="text-center p-2 bg-amber-50 border border-amber-700">
                            <div className="text-xs">DEF</div>
                            <div className="font-bold">{player.stats.defense}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center p-2 bg-amber-50 border border-amber-700">
                            <div className="text-xs">PITCH</div>
                            <div className="font-bold">{player.stats.pitching}</div>
                          </div>
                          <div className="text-center p-2 bg-amber-50 border border-amber-700">
                            <div className="text-xs">DEF</div>
                            <div className="font-bold">{player.stats.defense}</div>
                          </div>
                          <div className="col-span-2 text-center p-2 bg-amber-50 border border-amber-700">
                            <div className="text-xs">PROSPECT</div>
                            <div className="font-bold">READY</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setView('hub')}
            className="w-full py-4 bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800 text-xl font-bold"
          >
            ← BACK TO HUB
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: SEASON STATS & SALARIES (Stadium Aesthetic)
  // NOTE: Shows projected stats and assigns salary values
  // ============================================================================

  if (view === 'season-stats') {
    if (!myTeam) {
      return (
        <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
          <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
        </div>
      );
    }
    const positionPlayers = myTeam.roster.filter(p => p.type === 'position');
    const pitchers = myTeam.roster.filter(p => p.type === 'pitcher');

    return (
      <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: '"Courier New", monospace' }}>
        <div className="max-w-6xl mx-auto">
          
          <div className="bg-amber-900 text-amber-50 p-4 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-3xl font-bold text-center">SEASON {season.year} STATISTICS</h1>
            <p className="text-center text-amber-200 text-sm mt-2">Player Performance & Salary Evaluation</p>
          </div>

          {/* Position Players */}
          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
            <h2 className="text-2xl font-bold mb-4">POSITION PLAYERS</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-amber-900">
                    <th className="text-left p-2">NAME</th>
                    <th className="p-2">AB</th>
                    <th className="p-2">H</th>
                    <th className="p-2">AVG</th>
                    <th className="p-2">HR</th>
                    <th className="p-2">SB</th>
                    <th className="p-2">SALARY</th>
                  </tr>
                </thead>
                <tbody>
                  {positionPlayers.map((p, idx) => {
                    const stats = calculateSeasonStats(p);
                    const salary = calculateSalary(p);
                    return (
                      <tr key={idx} className="border-b border-amber-700">
                        <td className="p-2 font-bold">{p.name}</td>
                        <td className="p-2 text-center">{stats.atBats}</td>
                        <td className="p-2 text-center">{stats.hits}</td>
                        <td className="p-2 text-center">{stats.avg}</td>
                        <td className="p-2 text-center">{stats.homeRuns}</td>
                        <td className="p-2 text-center">{stats.stolenBases}</td>
                        <td className="p-2 text-center text-xl font-bold text-green-700">{salary}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pitchers */}
          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
            <h2 className="text-2xl font-bold mb-4">PITCHERS</h2>
            <div className="space-y-2">
              {pitchers.map((p, idx) => {
                const salary = calculateSalary(p);
                return (
                  <div key={idx} className="bg-white border-2 border-amber-700 p-3 flex justify-between items-center">
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs">PIT: {p.stats.pitching}</div>
                    </div>
                    <div className="text-2xl font-bold text-green-700">{salary}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Salary Cap Info */}
          <div className="bg-green-100 border-4 border-green-700 p-4 mb-6 text-center">
            <div className="text-sm">
              💡 SALARY CAP NOTE: Total team salaries will be capped in future seasons. 
              Draft picks do not count toward salary cap.
            </div>
          </div>

          <button
            onClick={() => setView('hub')}
            className="w-full py-4 bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800 text-xl font-bold"
          >
            ← BACK TO HUB
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: GAME RESULT (Stadium Aesthetic)
  // ============================================================================

  if (view === 'simulate' && gameResult) {
    if (!myTeam) {
      return (
        <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
          <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: '"Courier New", monospace' }}>
        <div className="max-w-4xl mx-auto">
          
          <div className={`p-8 mb-6 border-8 border-double text-center ${gameResult.won ? 'bg-green-100 border-green-700' : 'bg-red-100 border-red-700'}`}>
            <div className="text-6xl font-bold mb-4">
              {gameResult.won ? '✓ VICTORY' : '✗ DEFEAT'}
            </div>
            <div className="text-4xl mb-2">
              {myTeam.name} {gameResult.yourScore}
            </div>
            <div className="text-4xl">
              {gameResult.opponent} {gameResult.oppScore}
            </div>
          </div>

          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-sm text-stone-600">RECORD</div>
                <div className="text-4xl font-bold">{myTeam.record.wins}-{myTeam.record.losses}</div>
              </div>
              <div>
                <div className="text-sm text-stone-600">REMAINING</div>
                <div className="text-4xl font-bold">{season.totalGames - season.gamesPlayed}</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setGameResult(null);
              setView('hub');
            }}
            className="w-full py-6 text-2xl font-bold bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800"
          >
            CONTINUE →
          </button>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
      <div className="text-2xl font-bold text-amber-900">Loading...</div>
    </div>
  );
};

export default GMMode;