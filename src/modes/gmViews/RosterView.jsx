import React from 'react';
import { calculateSeasonStats, calculateSalary, formatStatChange, calculateRosterCost } from '../gmUtils';

const RosterView = ({ myTeam, season, lineup, setView }) => {
  if (!myTeam) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
      </div>
    );
  }
  
  const positionPlayers = myTeam.roster.filter(p => p.type === 'position');
  const pitchers = myTeam.roster.filter(p => p.type === 'pitcher');
  const minorLeaguePlayers = myTeam.minorLeague || [];

  return (
    <div className="min-h-screen bg-amber-50 p-4" style={{ fontFamily: '"Courier New", monospace' }}>
      <div className="max-w-6xl mx-auto">
        
        <div className="bg-amber-900 text-amber-50 p-4 mb-6 border-8 border-double border-amber-950">
          <h1 className="text-3xl font-bold text-center">{myTeam.name.toUpperCase()} ROSTER & PROJECTIONS</h1>
          <p className="text-center text-amber-200 text-sm mt-2">Season {season.year} Projected Stats</p>
        </div>

        {/* Active Roster */}
        <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
          <h2 className="text-2xl font-bold mb-4">ACTIVE ROSTER</h2>
          <div className="mb-4 text-sm text-gray-700">
            Salary Cap: ${myTeam.salaryCap}M | Current Cost: ${calculateRosterCost(myTeam)}M
          </div>
          
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-3">POSITION PLAYERS ({positionPlayers.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-amber-900">
                    <th className="text-left p-2">NAME</th>
                    <th className="p-2">POS</th>
                    <th className="p-2">HIT</th>
                    <th className="p-2">POW</th>
                    <th className="p-2">SPD</th>
                    <th className="p-2">DEF</th>
                    <th className="p-2">PROJ AVG</th>
                    <th className="p-2">PROJ HR</th>
                    <th className="p-2">PROJ SB</th>
                    <th className="p-2">SALARY</th>
                  </tr>
                </thead>
                <tbody>
                  {positionPlayers.map((p, idx) => {
                    const stats = calculateSeasonStats(p);
                    const salary = p.salary || calculateSalary(p);
                    const position = Object.entries(lineup).find(([pos, player]) => player?.id === p.id)?.[0] || 'UNASSIGNED';
                    return (
                      <tr key={idx} className="border-b border-amber-700">
                        <td className="p-2 font-bold">{p.name}</td>
                        <td className="p-2 text-center">{position}</td>
                        <td className="p-2 text-center">
                          {formatStatChange(p.stats.hitting, p.previousYearStats?.hitting)}
                        </td>
                        <td className="p-2 text-center">
                          {formatStatChange(p.stats.power, p.previousYearStats?.power)}
                        </td>
                        <td className="p-2 text-center">
                          {formatStatChange(p.stats.speed, p.previousYearStats?.speed)}
                        </td>
                        <td className="p-2 text-center">
                          {formatStatChange(p.stats.defense, p.previousYearStats?.defense)}
                        </td>
                        <td className="p-2 text-center">{stats.avg}</td>
                        <td className="p-2 text-center">{stats.homeRuns}</td>
                        <td className="p-2 text-center">{stats.stolenBases}</td>
                        <td className="p-2 text-center text-lg font-bold text-green-700">{salary}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">PITCHERS ({pitchers.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-amber-900">
                    <th className="text-left p-2">NAME</th>
                    <th className="p-2">PITCH</th>
                    <th className="p-2">DEF</th>
                    <th className="p-2">SALARY</th>
                  </tr>
                </thead>
                <tbody>
                  {pitchers.map((p, idx) => {
                    const salary = p.salary || calculateSalary(p);
                    return (
                      <tr key={idx} className="border-b border-amber-700">
                        <td className="p-2 font-bold">{p.name}</td>
                        <td className="p-2 text-center">
                          {formatStatChange(p.stats.pitching, p.previousYearStats?.pitching)}
                        </td>
                        <td className="p-2 text-center">
                          {formatStatChange(p.stats.defense, p.previousYearStats?.defense)}
                        </td>
                        <td className="p-2 text-center text-lg font-bold text-green-700">{salary}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Minor League Prospects */}
        <div className="bg-amber-100 p-6 border-4 border-amber-900 mb-6">
          <h2 className="text-2xl font-bold mb-4">MINOR LEAGUE PROSPECTS ({minorLeaguePlayers.length})</h2>
          
          {minorLeaguePlayers.length === 0 ? (
            <div className="text-center text-gray-600 py-8">
              No prospects in minor league system
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-amber-900">
                    <th className="text-left p-2">NAME</th>
                    <th className="p-2">TYPE</th>
                    <th className="p-2">HIT</th>
                    <th className="p-2">POW</th>
                    <th className="p-2">SPD</th>
                    <th className="p-2">DEF</th>
                    <th className="p-2">PROJ AVG</th>
                    <th className="p-2">PROJ HR</th>
                    <th className="p-2">PROJ SB</th>
                    <th className="p-2">POTENTIAL</th>
                    <th className="p-2">OVERALL</th>
                  </tr>
                </thead>
                <tbody>
                  {minorLeaguePlayers.map((p, idx) => {
                    const stats = calculateSeasonStats(p);
                    const overall = p.type === 'position' 
                      ? Math.round((p.stats.hitting + p.stats.power + p.stats.speed + p.stats.defense) / 4)
                      : p.stats.pitching;
                    return (
                      <tr key={idx} className="border-b border-amber-700">
                        <td className="p-2 font-bold">{p.name}</td>
                        <td className="p-2 text-center">{p.type === 'position' ? 'POS' : 'PIT'}</td>
                        {p.type === 'position' ? (
                          <>
                            <td className="p-2 text-center">
                              {formatStatChange(p.stats.hitting, p.previousYearStats?.hitting)}
                            </td>
                            <td className="p-2 text-center">
                              {formatStatChange(p.stats.power, p.previousYearStats?.power)}
                            </td>
                            <td className="p-2 text-center">
                              {formatStatChange(p.stats.speed, p.previousYearStats?.speed)}
                            </td>
                            <td className="p-2 text-center">
                              {formatStatChange(p.stats.defense, p.previousYearStats?.defense)}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 text-center">
                              {formatStatChange(p.stats.pitching, p.previousYearStats?.pitching)}
                            </td>
                            <td className="p-2 text-center">-</td>
                            <td className="p-2 text-center">-</td>
                            <td className="p-2 text-center">
                              {formatStatChange(p.stats.defense, p.previousYearStats?.defense)}
                            </td>
                          </>
                        )}
                        <td className="p-2 text-center">{stats.avg}</td>
                        <td className="p-2 text-center">{stats.homeRuns}</td>
                        <td className="p-2 text-center">{stats.stolenBases}</td>
                        <td className="p-2 text-center font-bold text-blue-700">{p.potential}</td>
                        <td className="p-2 text-center">{overall}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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

export default RosterView;

