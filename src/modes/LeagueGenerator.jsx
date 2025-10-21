import React, { useState } from 'react';

const LeagueGenerator = ({ universe, onExit }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [leagueData, setLeagueData] = useState(universe.league);

  const generateFace = (seed) => {
    const eyeOptions = ['I', '-', 'o', '•'];
    const mouthOptions = ['.', '-', '⌣', '◡'];
    const eyes = eyeOptions[seed % eyeOptions.length];
    const mouth = mouthOptions[Math.floor(seed / eyeOptions.length) % mouthOptions.length];
    return { eyes, mouth };
  };

  const getRating = (stat) => {
    if (stat >= 75) return { label: 'Elite', color: 'text-green-700' };
    if (stat >= 68) return { label: 'Great', color: 'text-green-600' };
    if (stat >= 60) return { label: 'Good', color: 'text-blue-600' };
    if (stat >= 52) return { label: 'Average', color: 'text-amber-700' };
    if (stat >= 45) return { label: 'Below Avg', color: 'text-orange-600' };
    return { label: 'Poor', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-amber-900 text-amber-50 p-6 mb-6 border-8 border-double border-amber-950">
          <h1 className="text-4xl font-bold text-center">LEAGUE GENERATOR</h1>
          <p className="text-center text-amber-200">8 Teams • 112 Players</p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => {
              universe.regenerate();
              setLeagueData([...universe.league]); // Force re-render with new data
              setSelectedTeam(null);
            }}
            className="flex-1 py-4 text-xl font-bold bg-red-700 text-amber-50 border-4 border-amber-900 hover:bg-red-800"
          >
            🎲 REGENERATE LEAGUE
          </button>
          <button
            onClick={onExit}
            className="flex-1 py-4 text-xl font-bold bg-stone-600 text-amber-50 border-4 border-amber-900 hover:bg-stone-700"
          >
            ← BACK TO MENU
          </button>
        </div>

        {leagueData.map((team, teamIdx) => {
          // Calculate team stats
          const hitting = Math.round(team.roster.filter(p => p.type === 'position').reduce((sum, p) => sum + p.stats.hitting, 0) / team.roster.filter(p => p.type === 'position').length);
          const power = Math.round(team.roster.filter(p => p.type === 'position').reduce((sum, p) => sum + p.stats.power, 0) / team.roster.filter(p => p.type === 'position').length);
          const speed = Math.round(team.roster.filter(p => p.type === 'position').reduce((sum, p) => sum + p.stats.speed, 0) / team.roster.filter(p => p.type === 'position').length);
          const defense = Math.round(team.roster.reduce((sum, p) => sum + p.stats.defense, 0) / team.roster.length);
          const pitching = Math.round(team.roster.filter(p => p.type === 'pitcher').reduce((sum, p) => sum + p.stats.pitching, 0) / team.roster.filter(p => p.type === 'pitcher').length);

          return (
            <div key={teamIdx} className="mb-8 bg-amber-100 border-4 border-amber-900 p-6">
              <div 
                className="flex items-center gap-4 mb-4 pb-4 border-b-4 border-amber-900 cursor-pointer hover:bg-amber-200"
                onClick={() => setSelectedTeam(selectedTeam === teamIdx ? null : teamIdx)}
              >
                <div className="w-20 h-20">
                  {team.logo(team.colors[0])}
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold">{team.city} {team.name}</h2>
                  <p className="text-sm">Record: {team.record.wins}-{team.record.losses}</p>
                  <p className="text-xs text-stone-600 mt-1">{team.roster.length} players • Click to {selectedTeam === teamIdx ? 'collapse' : 'expand'}</p>
                </div>
                <div className="text-4xl">
                  {selectedTeam === teamIdx ? '▼' : '▶'}
                </div>
              </div>

              {/* Team Stats Grid - Always Visible */}
              <div className="mb-4 p-4 bg-white border-2 border-amber-700">
                <h3 className="font-bold mb-2 text-center">TEAM STATS</h3>
                <div className="grid grid-cols-5 gap-3 text-center text-sm">
                  <div>
                    <div className="text-xs text-stone-600">HIT</div>
                    <div className="text-2xl font-bold">{hitting}</div>
                    <div className={`text-xs ${getRating(hitting).color}`}>
                      {getRating(hitting).label}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-600">POW</div>
                    <div className="text-2xl font-bold">{power}</div>
                    <div className={`text-xs ${getRating(power).color}`}>
                      {getRating(power).label}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-600">SPD</div>
                    <div className="text-2xl font-bold">{speed}</div>
                    <div className={`text-xs ${getRating(speed).color}`}>
                      {getRating(speed).label}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-600">DEF</div>
                    <div className="text-2xl font-bold">{defense}</div>
                    <div className={`text-xs ${getRating(defense).color}`}>
                      {getRating(defense).label}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-600">PITCH</div>
                    <div className="text-2xl font-bold">{pitching}</div>
                    <div className={`text-xs ${getRating(pitching).color}`}>
                      {getRating(pitching).label}
                    </div>
                  </div>
                </div>
              </div>

            {selectedTeam === teamIdx && (
              <>

                <div className="mb-4">
                  <h3 className="font-bold mb-3 text-lg">POSITION PLAYERS ({team.roster.filter(p => p.type === 'position').length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {team.roster.filter(p => p.type === 'position').map((player, playerIdx) => {
                      const face = generateFace(player.name.length);
                      return (
                        <div key={playerIdx} className="bg-white border-2 border-amber-700 overflow-hidden">
                          <div className="p-2 text-white text-center" style={{ backgroundColor: team.colors[0] }}>
                            <div className="text-xs">{team.city.toUpperCase()}</div>
                            <div className="text-sm font-bold">{player.name}</div>
                          </div>
                          
                          <div className="bg-amber-50 p-2 flex justify-center">
                            <svg width="60" height="75" viewBox="0 0 80 100">
                              <ellipse cx="40" cy="30" rx="30" ry="20" fill={team.colors[0]} stroke="#000" strokeWidth="2"/>
                              <path d="M 10 30 Q 40 38 70 30" fill={team.colors[0]} stroke="#000" strokeWidth="2"/>
                              <ellipse cx="40" cy="60" rx="25" ry="30" fill="#F5DEB3" stroke="#000" strokeWidth="2"/>
                              <text x="30" y="60" fontSize="12" fontWeight="bold">{face.eyes}</text>
                              <text x="48" y="60" fontSize="12" fontWeight="bold">{face.eyes}</text>
                              <text x="40" y="75" textAnchor="middle" fontSize="14">{face.mouth}</text>
                            </svg>
                          </div>
                          
                          <div className="p-2">
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div className="text-center p-1 bg-amber-50 border border-amber-700">
                                <div className="text-xs">HIT</div>
                                <div className="font-bold">{player.stats.hitting}</div>
                              </div>
                              <div className="text-center p-1 bg-amber-50 border border-amber-700">
                                <div className="text-xs">POW</div>
                                <div className="font-bold">{player.stats.power}</div>
                              </div>
                              <div className="text-center p-1 bg-amber-50 border border-amber-700">
                                <div className="text-xs">SPD</div>
                                <div className="font-bold">{player.stats.speed}</div>
                              </div>
                              <div className="text-center p-1 bg-amber-50 border border-amber-700">
                                <div className="text-xs">DEF</div>
                                <div className="font-bold">{player.stats.defense}</div>
                              </div>
                            </div>
                            <div className="text-xs text-center mt-1 text-stone-600">Age {player.age}</div>
                            {player.trait && (
                              <div className="text-xs text-center mt-1 text-amber-700">⭐ {player.trait.name}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-3 text-lg">PITCHERS ({team.roster.filter(p => p.type === 'pitcher').length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {team.roster.filter(p => p.type === 'pitcher').map((player, playerIdx) => {
                      const face = generateFace(player.name.length);
                      return (
                        <div key={playerIdx} className="bg-white border-2 border-amber-700 overflow-hidden">
                          <div className="p-2 text-white text-center" style={{ backgroundColor: team.colors[0] }}>
                            <div className="text-xs">{team.city.toUpperCase()}</div>
                            <div className="text-sm font-bold">{player.name}</div>
                          </div>
                          
                          <div className="bg-amber-50 p-2 flex justify-center">
                            <svg width="60" height="75" viewBox="0 0 80 100">
                              <ellipse cx="40" cy="30" rx="30" ry="20" fill={team.colors[0]} stroke="#000" strokeWidth="2"/>
                              <path d="M 10 30 Q 40 38 70 30" fill={team.colors[0]} stroke="#000" strokeWidth="2"/>
                              <ellipse cx="40" cy="60" rx="25" ry="30" fill="#F5DEB3" stroke="#000" strokeWidth="2"/>
                              <text x="30" y="60" fontSize="12" fontWeight="bold">{face.eyes}</text>
                              <text x="48" y="60" fontSize="12" fontWeight="bold">{face.eyes}</text>
                              <text x="40" y="75" textAnchor="middle" fontSize="14">{face.mouth}</text>
                            </svg>
                          </div>
                          
                          <div className="p-2">
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div className="text-center p-1 bg-amber-50 border border-amber-700">
                                <div className="text-xs">PITCH</div>
                                <div className="font-bold">{player.stats.pitching}</div>
                              </div>
                              <div className="text-center p-1 bg-amber-50 border border-amber-700">
                                <div className="text-xs">DEF</div>
                                <div className="font-bold">{player.stats.defense}</div>
                              </div>
                            </div>
                            <div className="text-xs text-center mt-1 text-stone-600">Age {player.age}</div>
                            {player.trait && (
                              <div className="text-xs text-center mt-1 text-amber-700">⭐ {player.trait.name}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeagueGenerator;