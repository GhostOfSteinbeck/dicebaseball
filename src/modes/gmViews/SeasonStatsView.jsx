import React from 'react';
import { calculateSeasonStats, calculateSalary } from '../gmUtils';

const SeasonStatsView = ({ myTeam, season, setView }) => {
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
          onClick={() => setView(season.seasonEnded ? 'season-end' : 'hub')}
          className="w-full py-4 bg-amber-700 text-amber-50 border-4 border-amber-900 hover:bg-amber-800 text-xl font-bold"
        >
          ← {season.seasonEnded ? 'BACK TO SEASON END' : 'BACK TO HUB'}
        </button>
      </div>
    </div>
  );
};

export default SeasonStatsView;

