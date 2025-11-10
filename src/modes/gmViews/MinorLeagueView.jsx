import React from 'react';
import { formatStatChange } from '../gmUtils';

const MinorLeagueView = ({ myTeam, setPromotionCandidate, setView }) => {
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
          <p className="text-center text-amber-200 text-sm mt-2">Top 5 Draft Picks Storage</p>
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
                  
                  <div className="grid grid-cols-4 gap-2 text-sm mb-3">
                    {player.type === 'position' ? (
                      <>
                        <div className="text-center p-2 bg-amber-50 border border-amber-700">
                          <div className="text-xs">HIT</div>
                          <div className="font-bold">{formatStatChange(player.stats.hitting, player.previousYearStats?.hitting)}</div>
                        </div>
                        <div className="text-center p-2 bg-amber-50 border border-amber-700">
                          <div className="text-xs">POW</div>
                          <div className="font-bold">{formatStatChange(player.stats.power, player.previousYearStats?.power)}</div>
                        </div>
                        <div className="text-center p-2 bg-amber-50 border border-amber-700">
                          <div className="text-xs">SPD</div>
                          <div className="font-bold">{formatStatChange(player.stats.speed, player.previousYearStats?.speed)}</div>
                        </div>
                        <div className="text-center p-2 bg-amber-50 border border-amber-700">
                          <div className="text-xs">DEF</div>
                          <div className="font-bold">{formatStatChange(player.stats.defense, player.previousYearStats?.defense)}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center p-2 bg-amber-50 border border-amber-700">
                          <div className="text-xs">PITCH</div>
                          <div className="font-bold">{formatStatChange(player.stats.pitching, player.previousYearStats?.pitching)}</div>
                        </div>
                        <div className="text-center p-2 bg-amber-50 border border-amber-700">
                          <div className="text-xs">DEF</div>
                          <div className="font-bold">{formatStatChange(player.stats.defense, player.previousYearStats?.defense)}</div>
                        </div>
                        <div className="col-span-2 text-center p-2 bg-amber-50 border border-amber-700">
                          <div className="text-xs">POTENTIAL</div>
                          <div className="font-bold">{player.potential}</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      setPromotionCandidate(player);
                      setView('promote-prospect');
                    }}
                    className="w-full py-2 bg-green-700 text-amber-50 border-2 border-amber-900 hover:bg-green-800 font-bold"
                  >
                    ⬆ PROMOTE TO MAJORS
                  </button>
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
};

export default MinorLeagueView;

