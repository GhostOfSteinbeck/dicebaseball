import React from 'react';

const StandingsView = ({ universe, myTeam, season, setView }) => {
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
                <div className="w-10 h-10 flex items-center justify-center">
                  {team.logo(team.colors[0])}
                </div>
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
};

export default StandingsView;

