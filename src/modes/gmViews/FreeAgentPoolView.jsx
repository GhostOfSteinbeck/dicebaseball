import React from 'react';
import { calculateSalary, salaryToValue, calculateRosterCost } from '../gmUtils';

const FreeAgentPoolView = ({ 
  myTeam, 
  universe, 
  selectedFreeAgent, 
  setSelectedFreeAgent,
  selectedToReplace,
  setSelectedToReplace,
  setView,
  setMyTeam
}) => {
  if (!myTeam) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
      </div>
    );
  }

  const freeAgents = universe.freeAgentPool || [];

  const signFreeAgent = () => {
    if (!selectedFreeAgent || !selectedToReplace) {
      alert('Please select a free agent and a player to replace');
      return;
    }

    // Check if we can afford the free agent
    const freeAgentCost = salaryToValue(selectedFreeAgent.salary || calculateSalary(selectedFreeAgent));
    const replacedPlayerCost = salaryToValue(selectedToReplace.salary || calculateSalary(selectedToReplace));
    const currentCost = calculateRosterCost(myTeam);
    const newCost = currentCost - replacedPlayerCost + freeAgentCost;

    if (newCost > myTeam.salaryCap) {
      alert(`Cannot sign: Would exceed salary cap (${myTeam.salaryCap}M). New cost would be ${newCost}M.`);
      return;
    }

    // Replace player
    const teamInUniverse = universe.league.find(t => t.name === myTeam.name);
    const playerIndex = teamInUniverse.roster.findIndex(p => p.id === selectedToReplace.id);
    if (playerIndex !== -1) {
      teamInUniverse.roster[playerIndex] = { ...selectedFreeAgent };
    }

    // Remove from free agent pool
    universe.freeAgentPool = universe.freeAgentPool.filter(p => p.id !== selectedFreeAgent.id);

    // Update local state
    setMyTeam(universe.league.find(t => t.name === myTeam.name));
    setSelectedFreeAgent(null);
    setSelectedToReplace(null);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        
        <div className="border-4 border-green-400 p-4 mb-6">
          <pre className="text-center">
{`╔════════════════════════════════════════╗
║     FREE AGENT POOL PROTOCOL            ║
║    [TOP 10 HIGHEST SALARIED PLAYERS]    ║
╚════════════════════════════════════════╝`}
          </pre>
        </div>

        <div className="mb-4 text-center">
          <div className="mb-2">Your Salary Cap: ${myTeam.salaryCap}M</div>
          <div className="mb-2">Current Roster Cost: ${calculateRosterCost(myTeam)}M</div>
          <div className="mb-2">Available: ${myTeam.salaryCap - calculateRosterCost(myTeam)}M</div>
        </div>

        {freeAgents.length === 0 ? (
          <div className="border-4 border-green-400 p-6 text-center mb-6">
            <div className="text-xl mb-4">NO FREE AGENTS AVAILABLE</div>
            <div className="text-sm">All available players have been signed or released.</div>
          </div>
        ) : (
          <>
            <div className="border-4 border-green-400 p-4 mb-6">
              <div className="text-amber-400 mb-3">AVAILABLE FREE AGENTS ({freeAgents.length}):</div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {freeAgents.map((player, idx) => {
                  const salary = player.salary || calculateSalary(player);
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedFreeAgent(player)}
                      className={`border-2 p-3 cursor-pointer ${
                        selectedFreeAgent?.id === player.id
                          ? 'bg-green-900 border-green-400'
                          : 'border-green-400 hover:bg-green-900'
                      }`}
                    >
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">{player.name}</span>
                        <span className="text-amber-400">Salary: {salary}</span>
                      </div>
                      <div className="text-xs grid grid-cols-4 gap-2">
                        {player.type === 'position' ? (
                          <>
                            <div>HIT: {player.stats.hitting}</div>
                            <div>POW: {player.stats.power}</div>
                            <div>SPD: {player.stats.speed}</div>
                            <div>DEF: {player.stats.defense}</div>
                          </>
                        ) : (
                          <>
                            <div>PIT: {player.stats.pitching}</div>
                            <div>DEF: {player.stats.defense}</div>
                            <div></div>
                            <div></div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedFreeAgent && (
              <div className="border-4 border-green-400 p-4 mb-6">
                <div className="text-amber-400 mb-3">SELECT PLAYER TO REPLACE (MUST MAINTAIN: 9 POSITION + 5 PITCHERS):</div>
                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                  {myTeam.roster
                    .filter(p => p.type === selectedFreeAgent.type)
                    .map((player) => {
                      const salary = player.salary || calculateSalary(player);
                      return (
                        <div
                          key={player.id}
                          onClick={() => setSelectedToReplace(player)}
                          className={`border-2 p-3 cursor-pointer ${
                            selectedToReplace?.id === player.id
                              ? 'bg-red-900 border-red-400'
                              : 'border-green-400 hover:bg-green-900'
                          }`}
                        >
                          <div className="flex justify-between mb-2">
                            <span>{player.name}</span>
                            <span className="text-xs">Salary: {salary}</span>
                          </div>
                          <div className="text-xs grid grid-cols-4 gap-2">
                            {player.type === 'position' ? (
                              <>
                                <div>HIT: {player.stats.hitting}</div>
                                <div>POW: {player.stats.power}</div>
                                <div>SPD: {player.stats.speed}</div>
                                <div>DEF: {player.stats.defense}</div>
                              </>
                            ) : (
                              <>
                                <div>PIT: {player.stats.pitching}</div>
                                <div>DEF: {player.stats.defense}</div>
                                <div></div>
                                <div></div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                onClick={signFreeAgent}
                disabled={!selectedFreeAgent || !selectedToReplace}
                className={`py-3 border-4 border-green-400 ${
                  selectedFreeAgent && selectedToReplace
                    ? 'hover:bg-green-400 hover:text-black'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                {'>'} SIGN FREE AGENT_
              </button>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => {
              setSelectedFreeAgent(null);
              setSelectedToReplace(null);
              setView('hub');
            }}
            className="w-full py-3 border-4 border-green-400 hover:bg-green-400 hover:text-black"
          >
            {'<'} BACK TO HUB_
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeAgentPoolView;

