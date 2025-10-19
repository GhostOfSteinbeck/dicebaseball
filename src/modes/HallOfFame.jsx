import React, { useState } from 'react';

const generateName = () => {
  const firstNames = ['Jack', 'Mike', 'Carlos', 'David', 'Jose', 'Alex', 'Ryan', 'Kevin', 'Luis', 'Matt', 'Chris', 'Derek', 'Tommy', 'Willie'];
  const lastNames = ['Rodriguez', 'Martinez', 'Johnson', 'Williams', 'Garcia', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

const generateHistoricalData = (currentYear) => {
  const teamNames = ['Monarchs', 'Grays', 'Eagles', 'Aces', 'Clippers', 'Smokies', 'Stars', 'Barons'];
  
  const history = {
    champions: [],
    mvps: [],
    cyYoung: [],
    statLeaders: []
  };
  
  // Generate last 5 years
  for (let i = 4; i >= 0; i--) {
    const year = currentYear - i - 1;
    
    // Champion
    const champion = teamNames[Math.floor(Math.random() * teamNames.length)];
    const wins = Math.floor(Math.random() * 8) + 16;
    const losses = 20 - wins;
    
    history.champions.push({
      year,
      team: champion,
      record: { wins, losses }
    });
    
    // MVP
    const mvpName = generateName();
    const mvpTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
    const homeRuns = Math.floor(Math.random() * 20) + 30;
    const avg = (Math.random() * 0.08 + 0.28).toFixed(3);
    const doubles = Math.floor(Math.random() * 10) + 25;
    const mvpScore = (homeRuns * 0.5) + (parseFloat(avg) * 0.25) + (doubles * 0.25);
    
    history.mvps.push({
      year,
      player: mvpName,
      team: mvpTeam,
      stats: {
        avg: avg,
        homeRuns: homeRuns,
        doubles: doubles,
        atBats: 500 + Math.floor(Math.random() * 100),
        hits: Math.floor(parseFloat(avg) * 600),
        rbi: Math.floor(Math.random() * 30) + 90
      },
      mvpScore: mvpScore.toFixed(3)
    });
    
    // Cy Young
    const cyName = generateName();
    const cyTeam = teamNames[Math.floor(Math.random() * teamNames.length)];
    const inningsPitched = Math.floor(Math.random() * 40) + 180;
    const runsAllowed = Math.floor(Math.random() * 25) + 60;
    const cyScore = (inningsPitched * 0.5) - (runsAllowed * 0.5);
    
    history.cyYoung.push({
      year,
      player: cyName,
      team: cyTeam,
      stats: {
        inningsPitched: inningsPitched,
        runsAllowed: runsAllowed,
        wins: Math.floor(Math.random() * 5) + 15,
        strikeouts: Math.floor(Math.random() * 60) + 160,
        era: (runsAllowed / inningsPitched * 9).toFixed(2)
      },
      cyScore: cyScore.toFixed(3)
    });
    
    // Stat Leaders
    history.statLeaders.push({
      year,
      categories: {
        battingAvg: {
          leader: generateName(),
          team: teamNames[Math.floor(Math.random() * teamNames.length)],
          value: (Math.random() * 0.06 + 0.34).toFixed(3)
        },
        homeRuns: {
          leader: mvpName,
          team: mvpTeam,
          value: homeRuns + Math.floor(Math.random() * 5)
        },
        stolenBases: {
          leader: generateName(),
          team: teamNames[Math.floor(Math.random() * teamNames.length)],
          value: Math.floor(Math.random() * 20) + 35
        },
        rbi: {
          leader: generateName(),
          team: teamNames[Math.floor(Math.random() * teamNames.length)],
          value: Math.floor(Math.random() * 25) + 105
        },
        strikeouts: {
          leader: cyName,
          team: cyTeam,
          value: Math.floor(Math.random() * 50) + 200
        },
        wins: {
          leader: generateName(),
          team: teamNames[Math.floor(Math.random() * teamNames.length)],
          value: Math.floor(Math.random() * 4) + 18
        }
      }
    });
  }
  
  return history;
};

const HallOfFame = ({ onExit }) => {
  const currentYear = 2025;
  const [history] = useState(() => generateHistoricalData(currentYear));
  const [view, setView] = useState('champions');
  
  const NavButton = ({ id, label, active }) => (
    <button
      onClick={() => setView(id)}
      className={`py-3 px-6 font-bold border-4 border-amber-900 transition-all ${
        active ? 'bg-amber-700 text-amber-50' : 'bg-amber-100 hover:bg-amber-200'
      }`}
    >
      {label}
    </button>
  );
  
  return (
    <div className="min-h-screen bg-amber-50 p-4" style={{
      backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(139, 69, 19, 0.03) 2px, rgba(139, 69, 19, 0.03) 4px)`,
      fontFamily: '"Courier New", monospace'
    }}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-amber-900 text-amber-50 p-8 mb-6 border-8 border-double border-amber-950">
          <h1 className="text-5xl font-bold text-center mb-2">🏆 HALL OF FAME 🏆</h1>
          <p className="text-center text-amber-200 text-lg tracking-widest">LEGENDS OF THE GAME</p>
          <p className="text-center text-amber-300 text-sm mt-2">Last 5 Years of Glory</p>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <NavButton id="champions" label="CHAMPIONS" active={view === 'champions'} />
          <NavButton id="mvp" label="MVP AWARDS" active={view === 'mvp'} />
          <NavButton id="cyYoung" label="CY YOUNG" active={view === 'cyYoung'} />
          <NavButton id="leaders" label="STAT LEADERS" active={view === 'leaders'} />
        </div>
        
        {/* Champions View */}
        {view === 'champions' && (
          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
            <h2 className="text-3xl font-bold mb-6 text-center tracking-wider">CHAMPIONSHIP HISTORY</h2>
            <div className="space-y-4">
              {history.champions.slice().reverse().map((champ, idx) => (
                <div key={idx} className="bg-white border-4 border-amber-700 p-6 hover:bg-amber-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-6xl font-bold text-amber-900">{champ.year}</div>
                      <div>
                        <div className="text-3xl font-bold text-stone-800">{champ.team}</div>
                        <div className="text-lg text-stone-600 mt-1">
                          Season Record: {champ.record.wins}-{champ.record.losses}
                        </div>
                        <div className="text-sm text-stone-500">
                          Win %: {(champ.record.wins / 20).toFixed(3)}
                        </div>
                      </div>
                    </div>
                    <div className="text-7xl">🏆</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* MVP View */}
        {view === 'mvp' && (
          <div>
            <div className="bg-green-100 p-4 mb-6 border-4 border-green-700">
              <div className="text-center">
                <div className="text-lg font-bold mb-2">MVP CALCULATION</div>
                <div className="text-sm">
                  MVP Score = <span className="font-bold">(Home Runs × 50%)</span> + 
                  <span className="font-bold"> (Batting Average × 25%)</span> + 
                  <span className="font-bold"> (Doubles × 25%)</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
              <h2 className="text-3xl font-bold mb-6 text-center tracking-wider">⭐ MVP WINNERS ⭐</h2>
              <div className="space-y-4">
                {history.mvps.slice().reverse().map((mvp, idx) => (
                  <div key={idx} className="bg-white border-4 border-amber-700 overflow-hidden">
                    <div className="bg-amber-900 text-amber-50 p-4 border-b-4 border-amber-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs tracking-widest mb-1">{mvp.year} MOST VALUABLE PLAYER</div>
                          <div className="text-3xl font-bold">{mvp.player}</div>
                          <div className="text-sm text-amber-200">{mvp.team}</div>
                        </div>
                        <div className="text-6xl">⭐</div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-6 gap-4">
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">AVG</div>
                          <div className="text-2xl font-bold">{mvp.stats.avg}</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">HOME RUNS</div>
                          <div className="text-2xl font-bold">{mvp.stats.homeRuns}</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">DOUBLES</div>
                          <div className="text-2xl font-bold">{mvp.stats.doubles}</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">HITS</div>
                          <div className="text-2xl font-bold">{mvp.stats.hits}</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">RBI</div>
                          <div className="text-2xl font-bold">{mvp.stats.rbi}</div>
                        </div>
                        <div className="text-center p-3 bg-green-100 border-2 border-green-700">
                          <div className="text-xs text-stone-600">MVP SCORE</div>
                          <div className="text-2xl font-bold text-green-700">{mvp.mvpScore}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Cy Young View */}
        {view === 'cyYoung' && (
          <div>
            <div className="bg-green-100 p-4 mb-6 border-4 border-green-700">
              <div className="text-center">
                <div className="text-lg font-bold mb-2">CY YOUNG CALCULATION</div>
                <div className="text-sm">
                  Cy Young Score = <span className="font-bold">(Innings Pitched × 50%)</span> - 
                  <span className="font-bold"> (Runs Allowed × 50%)</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
              <h2 className="text-3xl font-bold mb-6 text-center tracking-wider">🏆 CY YOUNG WINNERS 🏆</h2>
              <div className="space-y-4">
                {history.cyYoung.slice().reverse().map((cy, idx) => (
                  <div key={idx} className="bg-white border-4 border-amber-700 overflow-hidden">
                    <div className="bg-stone-800 text-amber-50 p-4 border-b-4 border-amber-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-xs tracking-widest mb-1">{cy.year} CY YOUNG AWARD</div>
                          <div className="text-3xl font-bold">{cy.player}</div>
                          <div className="text-sm text-amber-200">{cy.team}</div>
                        </div>
                        <div className="text-6xl">🏆</div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="grid grid-cols-6 gap-4">
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">IP</div>
                          <div className="text-2xl font-bold">{cy.stats.inningsPitched}</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">RA</div>
                          <div className="text-2xl font-bold">{cy.stats.runsAllowed}</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">WINS</div>
                          <div className="text-2xl font-bold">{cy.stats.wins}</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">K</div>
                          <div className="text-2xl font-bold">{cy.stats.strikeouts}</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 border-2 border-amber-700">
                          <div className="text-xs text-stone-600">ERA</div>
                          <div className="text-2xl font-bold">{cy.stats.era}</div>
                        </div>
                        <div className="text-center p-3 bg-green-100 border-2 border-green-700">
                          <div className="text-xs text-stone-600">CY SCORE</div>
                          <div className="text-2xl font-bold text-green-700">{cy.cyScore}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Stat Leaders View */}
        {view === 'leaders' && (
          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
            <h2 className="text-3xl font-bold mb-6 text-center tracking-wider">STATISTICAL LEADERS</h2>
            <div className="space-y-6">
              {history.statLeaders.slice().reverse().map((yearData, idx) => (
                <div key={idx} className="bg-white border-4 border-amber-700 p-6">
                  <h3 className="text-2xl font-bold mb-4 text-center">{yearData.year} SEASON</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-amber-50 border-2 border-amber-700">
                      <div className="text-xs text-stone-600 mb-2">BATTING AVG</div>
                      <div className="font-bold text-lg">{yearData.categories.battingAvg.leader}</div>
                      <div className="text-sm text-stone-600">{yearData.categories.battingAvg.team}</div>
                      <div className="text-3xl font-bold text-amber-900 mt-2">
                        {yearData.categories.battingAvg.value}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border-2 border-amber-700">
                      <div className="text-xs text-stone-600 mb-2">HOME RUNS</div>
                      <div className="font-bold text-lg">{yearData.categories.homeRuns.leader}</div>
                      <div className="text-sm text-stone-600">{yearData.categories.homeRuns.team}</div>
                      <div className="text-3xl font-bold text-amber-900 mt-2">
                        {yearData.categories.homeRuns.value}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border-2 border-amber-700">
                      <div className="text-xs text-stone-600 mb-2">STOLEN BASES</div>
                      <div className="font-bold text-lg">{yearData.categories.stolenBases.leader}</div>
                      <div className="text-sm text-stone-600">{yearData.categories.stolenBases.team}</div>
                      <div className="text-3xl font-bold text-amber-900 mt-2">
                        {yearData.categories.stolenBases.value}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border-2 border-amber-700">
                      <div className="text-xs text-stone-600 mb-2">RBI</div>
                      <div className="font-bold text-lg">{yearData.categories.rbi.leader}</div>
                      <div className="text-sm text-stone-600">{yearData.categories.rbi.team}</div>
                      <div className="text-3xl font-bold text-amber-900 mt-2">
                        {yearData.categories.rbi.value}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border-2 border-amber-700">
                      <div className="text-xs text-stone-600 mb-2">STRIKEOUTS (P)</div>
                      <div className="font-bold text-lg">{yearData.categories.strikeouts.leader}</div>
                      <div className="text-sm text-stone-600">{yearData.categories.strikeouts.team}</div>
                      <div className="text-3xl font-bold text-amber-900 mt-2">
                        {yearData.categories.strikeouts.value}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-50 border-2 border-amber-700">
                      <div className="text-xs text-stone-600 mb-2">WINS (P)</div>
                      <div className="font-bold text-lg">{yearData.categories.wins.leader}</div>
                      <div className="text-sm text-stone-600">{yearData.categories.wins.team}</div>
                      <div className="text-3xl font-bold text-amber-900 mt-2">
                        {yearData.categories.wins.value}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 bg-stone-800 text-amber-100 p-4 border-4 border-amber-900 text-center text-sm">
          <div className="font-bold mb-2">✓ HISTORICAL STATS</div>
          <div>
            Data from the last 5 years. MVP and Cy Young winners calculated using weighted formulas.
            This data will be live once Career Mode and GM Mode are fully integrated with Universe State.
          </div>
        </div>
        
        <button
          onClick={onExit}
          className="w-full mt-6 py-4 text-xl font-bold bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800"
        >
          ← BACK TO MENU
        </button>
      </div>
    </div>
  );
};

export default HallOfFame;