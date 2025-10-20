import React, { useState } from 'react';
import { UniverseState } from './engine/universeState';
import { GAME_CONFIG } from './engine/gameEngine';
import GMMode from './modes/GMMode';
import CareerMode from './modes/CareerMode';
import LeagueGenerator from './modes/LeagueGenerator';

function App() {
  const [universe] = useState(() => new UniverseState());
  const [screen, setScreen] = useState('menu');
  const [selectedTeam] = useState(() => universe.league[0]);
  

  
  // Menu Screen
  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-amber-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-900 text-amber-50 p-8 mb-8 border-8 border-double border-amber-950 text-center">
            <h1 className="text-6xl font-bold mb-2" style={{ fontFamily: '"Courier New", monospace' }}>
              ⚾ DICE BASEBALL ⚾
            </h1>
            <p className="text-amber-200 text-lg tracking-widest">WHERE LEGENDS ARE ROLLED</p>
            <div className="text-xs text-amber-300 mt-2">Season {universe.currentYear}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div onClick={() => setScreen('career-select')} className="bg-amber-100 border-4 border-amber-900 p-8 cursor-pointer hover:bg-amber-200 transition-all hover:scale-105">
              <div className="border-2 border-dashed border-amber-700 p-6">
                <div className="text-center">
                  <div className="text-xs tracking-widest text-amber-900 mb-2">⭐ ADMIT ONE ⭐</div>
                  <div className="text-4xl font-bold mb-3">CAREER MODE</div>
                  <div className="text-sm text-stone-600 mb-4 leading-relaxed">
                    Create a prospect and grind through the minors. Build your legend one at-bat at a time.
                  </div>
                  <div className="bg-amber-900 text-amber-50 py-3 px-6 text-lg font-bold inline-block">
                    PLAY BALL
                  </div>
                </div>
              </div>
            </div>
            
            <div onClick={() => setScreen('gm-mode')} className="bg-amber-100 border-4 border-amber-900 p-8 cursor-pointer hover:bg-amber-200 transition-all hover:scale-105">
              <div className="border-2 border-dashed border-amber-700 p-6">
                <div className="text-center">
                  <div className="text-xs tracking-widest text-amber-900 mb-2">⭐ ADMIT ONE ⭐</div>
                  <div className="text-4xl font-bold mb-3">GM MODE</div>
                  <div className="text-sm text-stone-600 mb-4 leading-relaxed">
                    Draft prospects, manage rosters, and build a dynasty. Lead your franchise to glory.
                  </div>
                  <div className="bg-amber-900 text-amber-50 py-3 px-6 text-lg font-bold inline-block">
                    MANAGE TEAM
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div onClick={() => setScreen('league-generator')} className="bg-stone-800 text-amber-100 border-4 border-amber-900 p-6 cursor-pointer hover:bg-stone-700 transition-all">
              <div className="text-center">
                <div className="text-3xl mb-2">🎲</div>
                <div className="text-xl font-bold mb-2">LEAGUE</div>
                <div className="text-xs">Generate New League</div>
              </div>
            </div>
            
            <div onClick={() => setScreen('hall-of-fame')} className="bg-stone-800 text-amber-100 border-4 border-amber-900 p-6 cursor-pointer hover:bg-stone-700 transition-all">
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-xl font-bold mb-2">HALL OF FAME</div>
                <div className="text-xs">Champions, MVPs & Legends</div>
              </div>
            </div>
            
            <div onClick={() => setScreen('universe')} className="bg-stone-800 text-amber-100 border-4 border-amber-900 p-6 cursor-pointer hover:bg-stone-700 transition-all">
              <div className="text-center">
                <div className="text-3xl mb-2">🌐</div>
                <div className="text-xl font-bold mb-2">UNIVERSE</div>
                <div className="text-xs">Teams, Players & Standings</div>
              </div>
            </div>
            
            <div onClick={() => setScreen('settings')} className="bg-stone-800 text-amber-100 border-4 border-amber-900 p-6 cursor-pointer hover:bg-stone-700 transition-all">
              <div className="text-center">
                <div className="text-3xl mb-2">⚙️</div>
                <div className="text-xl font-bold mb-2">SETTINGS</div>
                <div className="text-xs">Balance & Configuration</div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-green-100 p-4 border-4 border-green-700 text-center">
            <div className="text-sm">
              <span className="font-bold">✓ INTEGRATED UNIVERSE:</span> Career Mode and GM Mode share the same world. 
              Your actions affect the league standings. Graduate from Career Mode and enter GM Mode drafts.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Career Team Selection
  if (screen === 'career-select') {
    return (
      <div className="min-h-screen bg-amber-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-900 text-amber-50 p-6 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-4xl font-bold text-center">SELECT YOUR TEAM</h1>
            <p className="text-center text-amber-200 text-sm mt-2">Career Mode</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {universe.league.map((team, idx) => (
              <div key={idx} onClick={() => setScreen('career-mode')} className="cursor-pointer hover:scale-105 transition-transform">
                <div className="p-6 border-4 border-amber-900 text-center text-white" style={{ backgroundColor: team.colors[0] }}>
                  <div className="w-16 h-16 mx-auto mb-2">{team.logo(team.colors[0])}</div>
                  <div className="text-xs mb-1">{team.city.toUpperCase()}</div>
                  <div className="text-2xl font-bold">{team.name}</div>
                  <div className="text-sm mt-2">{team.record.wins}-{team.record.losses}</div>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={() => setScreen('menu')} className="w-full py-4 text-xl font-bold bg-stone-600 text-amber-50 border-4 border-amber-900 hover:bg-stone-700">
            ← BACK TO MENU
          </button>
        </div>
      </div>
    );
  }

  
  if (screen === 'gm-mode') {
    return (
    <GMMode 
      selectedTeam={selectedTeam}
      universe={universe}
      onExit={() => setScreen('menu')}
    />
  )}

  // Career Mode
  if (screen === 'career-mode') {
    return (
      <CareerMode 
        selectedTeam={selectedTeam}
        universe={universe}
        onExit={() => setScreen('menu')}
      />
    );
  }

  // League Generator
  if (screen === 'league-generator') {
    return (
      <LeagueGenerator 
        universe={universe}
        onExit={() => setScreen('menu')}
      />
    );
  }
  
  // Hall of Fame Placeholder
  if (screen === 'hall-of-fame') {
    return (
      <div className="min-h-screen bg-amber-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-900 text-amber-50 p-6 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-4xl font-bold text-center">🏆 HALL OF FAME 🏆</h1>
            <p className="text-center text-amber-200 text-sm mt-2">Champions, MVPs & Cy Young Winners</p>
          </div>
          
          <div className="bg-amber-100 p-8 border-4 border-amber-900 mb-6 text-center">
            <div className="text-2xl font-bold mb-4">COMING SOON</div>
            <div className="text-lg mb-6">
              View the last 5 years of champions, MVP winners (calculated by 50% HR + 25% AVG + 25% 2B),
              and Cy Young winners (50% IP - 50% RA).
            </div>
            <div className="text-sm text-stone-600">
              This will replace the old Test Inning mode with a proper stats history viewer.
            </div>
          </div>
          
          <button onClick={() => setScreen('menu')} className="w-full py-4 text-xl font-bold bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800">
            ← BACK TO MENU
          </button>
        </div>
      </div>
    );
  }
  
  // Universe View
  if (screen === 'universe') {
    const standings = universe.getStandings();
    
    return (
      <div className="min-h-screen bg-amber-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-amber-900 text-amber-50 p-6 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-4xl font-bold text-center">🌐 THE UNIVERSE 🌐</h1>
            <p className="text-center text-amber-200 text-sm mt-2">Season {universe.currentYear}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-amber-100 p-6 border-4 border-amber-900">
              <h2 className="text-2xl font-bold mb-4">Current Standings</h2>
              <div className="space-y-2">
                {standings.map((team, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white border-2 border-amber-700">
                    <div className="text-2xl font-bold w-8">{idx + 1}</div>
                    <div className="w-8 h-8 border-2 border-amber-900" style={{ backgroundColor: team.colors[0] }} />
                    <div className="flex-1">
                      <div className="font-bold">{team.city} {team.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{team.record.wins}-{team.record.losses}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-amber-100 p-6 border-4 border-amber-900">
              <h2 className="text-2xl font-bold mb-4">League Overview</h2>
              <div className="space-y-4">
                <div className="p-4 bg-white border-2 border-amber-700">
                  <div className="text-xs text-stone-600">CURRENT SEASON</div>
                  <div className="text-3xl font-bold">{universe.currentYear}</div>
                </div>
                <div className="p-4 bg-white border-2 border-amber-700">
                  <div className="text-xs text-stone-600">TOTAL TEAMS</div>
                  <div className="text-3xl font-bold">{universe.league.length}</div>
                </div>
                <div className="p-4 bg-white border-2 border-amber-700">
                  <div className="text-xs text-stone-600">TOTAL PLAYERS</div>
                  <div className="text-3xl font-bold">{universe.league.reduce((sum, t) => sum + t.roster.length, 0)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <button onClick={() => setScreen('menu')} className="w-full py-4 text-xl font-bold bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800">
            ← BACK TO MENU
          </button>
        </div>
      </div>
    );
  }
  
  // Settings
  if (screen === 'settings') {
    return (
      <div className="min-h-screen bg-amber-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-amber-900 text-amber-50 p-6 mb-6 border-8 border-double border-amber-950">
            <h1 className="text-4xl font-bold text-center">⚙️ SETTINGS ⚙️</h1>
            <p className="text-center text-amber-200 text-sm mt-2">Balance & Configuration</p>
          </div>
          
          <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
            <h2 className="text-2xl font-bold mb-4">Current Configuration</h2>
            <div className="space-y-3 font-mono text-sm">
              <div className="p-3 bg-white border-2 border-amber-700">
                <div className="font-bold mb-2">Dice Outcomes:</div>
                <div className="pl-4 space-y-1 text-xs">
                  <div>Strikeout: ≤ -8</div>
                  <div>Single: 5-10</div>
                  <div>Double: 11-14</div>
                  <div>Triple: 15</div>
                  <div>Home Run: 16+</div>
                </div>
              </div>
              
              <div className="p-3 bg-white border-2 border-amber-700">
                <div className="font-bold mb-2">XP System:</div>
                <div className="pl-4 space-y-1 text-xs">
                  <div>Single: {GAME_CONFIG.xp.single} XP</div>
                  <div>Double/Triple: {GAME_CONFIG.xp.double} XP</div>
                  <div>Home Run: {GAME_CONFIG.xp.homerun} XP</div>
                  <div>Upgrade Cost: {GAME_CONFIG.xp.upgradeCost} XP</div>
                </div>
              </div>
              
              <div className="p-3 bg-white border-2 border-amber-700">
                <div className="font-bold mb-2">Season Structure:</div>
                <div className="pl-4 space-y-1 text-xs">
                  <div>Games per Season: {GAME_CONFIG.career.gamesPerSeason}</div>
                  <div>At-Bats per Game: {GAME_CONFIG.career.atBatsPerGame}</div>
                  <div>Roster Size: {GAME_CONFIG.gm.rosterSize}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-100 p-6 border-4 border-green-700 text-center mb-6">
            <div className="text-lg font-bold mb-2">✓ CONFIGURATION CENTRALIZED</div>
            <div className="text-sm">
              All game rules now live in one place (GAME_CONFIG). 
              Future phases will add editable sliders here.
            </div>
          </div>
          
          <button onClick={() => setScreen('menu')} className="w-full py-4 text-xl font-bold bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800">
            ← BACK TO MENU
          </button>
        </div>
      </div>
    );
  }
  
  return null;
}

export default App;