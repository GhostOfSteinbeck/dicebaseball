import React from 'react';

const LineupView = ({ myTeam, lineup, assignPosition, removeFromPosition, setView }) => {
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
};

export default LineupView;

