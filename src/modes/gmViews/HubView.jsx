import React from 'react';

const HubView = ({ myTeam, season, gameResult, setGameResult, simulateGame, universe, onExit, setView }) => {
  return (
    <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: '"Courier New", monospace' }}>
      <style>{`
        @keyframes firework {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          50% { transform: translateY(-100px) scale(1.5); opacity: 0.8; }
          100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
        }
        .animate-firework {
          animation: firework ease-out forwards;
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        
        <div className="bg-amber-900 text-amber-50 p-4 mb-4 border-8 border-double border-amber-950">
          <div className="text-center">
            <div className="text-xs tracking-widest">GENERAL MANAGER</div>
            <h1 className="text-4xl font-bold">{myTeam.city.toUpperCase()} {myTeam.name.toUpperCase()}</h1>
            <div className="text-sm text-amber-200 mt-2">
              YEAR {season.year} | GAME {season.gamesPlayed}/{season.totalGames} | {myTeam.record.wins}-{myTeam.record.losses}
            </div>
          </div>
        </div>

        {/* Exit Button */}
        <div className="mb-4">
          <button
            onClick={onExit}
            className="w-full py-2 bg-red-600 text-white border-4 border-red-800 hover:bg-red-700 text-sm font-bold"
          >
            ← EXIT TO MENU
          </button>
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
          
          {/* Game Result Overlay */}
          {gameResult && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`p-8 text-center border-8 border-double ${gameResult.won ? 'bg-green-100 border-green-700' : 'bg-red-100 border-red-700'}`}>
                <div className="text-6xl font-bold mb-4">
                  {gameResult.won ? '✓ VICTORY' : '✗ DEFEAT'}
                </div>
                <div className="text-4xl mb-2">
                  {myTeam.name} {gameResult.yourScore}
                </div>
                <div className="text-4xl mb-4">
                  {gameResult.opponent} {gameResult.oppScore}
                </div>
                
                {/* Player of the Game */}
                {gameResult.won && gameResult.playerOfTheGame && (
                  <div className="bg-amber-200 p-4 border-4 border-amber-800 mb-4">
                    <div className="text-2xl font-bold text-amber-900">PLAYER OF THE GAME</div>
                    <div className="text-xl font-bold">{gameResult.playerOfTheGame.player.name}</div>
                    <div className="text-lg">{gameResult.playerOfTheGame.performance}</div>
                  </div>
                )}
                
                <button
                  onClick={() => setGameResult(null)}
                  className="bg-amber-700 text-amber-50 py-3 px-8 text-xl font-bold border-4 border-amber-900 hover:bg-amber-800"
                >
                  CONTINUE
                </button>
              </div>
            </div>
          )}
          
          {/* Fireworks Animation */}
          {gameResult && gameResult.won && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-firework"
                  style={{
                    left: `${300 + (i * 25)}px`,
                    top: '200px',
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '3s'
                  }}
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'][i]
                    }}
                  />
                </div>
              ))}
            </div>
          )}
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

          {universe.freeAgentPool && universe.freeAgentPool.length > 0 && (
            <button
              onClick={() => setView('free-agent-pool')}
              className="bg-amber-100 border-4 border-amber-900 p-6 hover:bg-amber-200"
            >
              <div className="text-2xl font-bold mb-2">FREE AGENT POOL</div>
              <div className="text-sm">Available players ({universe.freeAgentPool.length})</div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HubView;

