import React from 'react';

const SeasonEndView = ({ myTeam, universe, season, startDraft, setView, startPlayoffs }) => {
  if (!myTeam) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
      </div>
    );
  }

  // Calculate final standings
  const finalStandings = [...universe.league].sort((a, b) => {
    const aTotal = a.record.wins + a.record.losses;
    const bTotal = b.record.wins + b.record.losses;
    const aPct = aTotal === 0 ? 0 : a.record.wins / aTotal;
    const bPct = bTotal === 0 ? 0 : b.record.wins / bTotal;
    return bPct - aPct || b.record.wins - a.record.wins;
  });

  const teamFinish = finalStandings.findIndex(t => t.name === myTeam.name) + 1;
  const ordinalSuffix = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        
        <div className="border-4 border-green-400 p-6 mb-6">
          <pre className="text-center text-2xl">
{`╔════════════════════════════════════════╗
║      SEASON ${season.year} COMPLETE           ║
║        FINAL STANDINGS REPORT          ║
╚════════════════════════════════════════╝`}
          </pre>
        </div>

        {/* Team Finish */}
        <div className={`border-4 p-6 mb-6 text-center ${
          teamFinish <= 3 ? 'border-amber-400 bg-amber-950' : 'border-green-400'
        }`}>
          <div className="text-xs mb-2">YOUR TEAM:</div>
          <div className="text-3xl font-bold mb-2">{myTeam.city} {myTeam.name}</div>
          <div className="text-5xl font-bold mb-2 text-amber-400">{ordinalSuffix(teamFinish)} PLACE</div>
          <div className="text-2xl">{myTeam.record.wins}-{myTeam.record.losses}</div>
        </div>

        {/* Final Standings */}
        <div className="border-4 border-green-400 p-4 mb-6">
          <div className="text-amber-400 mb-3 text-center">FINAL LEAGUE STANDINGS:</div>
          <div className="space-y-2">
            {finalStandings.map((team, idx) => (
              <div 
                key={idx}
                className={`flex justify-between p-2 border-2 ${
                  team.name === myTeam.name 
                    ? 'border-amber-400 bg-amber-950' 
                    : 'border-green-400'
                }`}
              >
                <div className="flex gap-4">
                  <span className="w-8">{idx + 1}.</span>
                  <span>{team.city} {team.name}</span>
                </div>
                <span className="font-bold">{team.record.wins}-{team.record.losses}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setView('season-stats')}
            className="py-4 border-4 border-green-400 hover:bg-green-400 hover:text-black"
          >
            {'>'} VIEW SEASON STATS_
          </button>
          
          <button
            onClick={startPlayoffs}
            className="py-4 border-4 border-green-400 hover:bg-green-400 hover:text-black"
          >
            {'>'} BEGIN PLAYOFFS_
          </button>
          
          <button
            onClick={startDraft}
            className="py-4 border-4 border-green-400 hover:bg-green-400 hover:text-black"
          >
            {'>'} BEGIN YEAR {season.year + 1} DRAFT_
          </button>
        </div>

        <div className="mt-4 p-3 border-2 border-green-400 text-center text-xs">
          NOTE: You must complete the draft to continue to the next season.
        </div>
      </div>
    </div>
  );
};

export default SeasonEndView;

