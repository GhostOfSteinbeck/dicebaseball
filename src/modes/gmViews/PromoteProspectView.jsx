import React from 'react';
import { formatStatChange } from '../gmUtils';

const PromoteProspectView = ({ 
  myTeam, 
  universe, 
  promotionCandidate,
  selectedToCut,
  setSelectedToCut,
  setView,
  setMyTeam,
  setPromotionCandidate
}) => {
  if (!myTeam || !promotionCandidate) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-amber-900">Loading...</div>
      </div>
    );
  }

  const executePromotion = () => {
    if (!selectedToCut) {
      alert('Please select a player to cut from the roster');
      return;
    }

    // Remove the cut player from roster
    const newRoster = myTeam.roster.filter(p => p.id !== selectedToCut.id);
    
    // Add the promoted prospect to roster (without potential field for active players)
    const promotedPlayer = { ...promotionCandidate };
    delete promotedPlayer.potential; // Remove potential field for active roster
    newRoster.push(promotedPlayer);
    
    // Update team in universe
    const teamInUniverse = universe.league.find(t => t.name === myTeam.name);
    teamInUniverse.roster = newRoster;
    
    // Remove prospect from minor league
    teamInUniverse.minorLeague = teamInUniverse.minorLeague.filter(p => p.id !== promotionCandidate.id);
    
    // Update local state
    setMyTeam(teamInUniverse);
    setPromotionCandidate(null);
    setSelectedToCut(null);
    
    // Return to hub
    setView('hub');
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        
        <div className="border-4 border-green-400 p-4 mb-6">
          <pre className="text-center">
{`╔════════════════════════════════════════╗
║     ROSTER MANAGEMENT PROTOCOL         ║
║       [PROMOTE FROM MINORS]            ║
╚════════════════════════════════════════╝`}
          </pre>
        </div>

        {/* Prospect to Promote */}
        <div className="border-4 border-green-400 p-4 mb-6">
          <div className="text-amber-400 mb-3">PROMOTING TO ACTIVE ROSTER:</div>
          <div className="border-2 border-green-400 p-3">
            <div className="flex justify-between mb-2">
              <span className="text-xl font-bold">{promotionCandidate.name}</span>
              <span>[{promotionCandidate.type === 'position' ? 'POSITION' : 'PITCHER'}]</span>
            </div>
            <div className="text-xs grid grid-cols-4 gap-2">
              {promotionCandidate.type === 'position' ? (
                <>
                  <div>HIT: {promotionCandidate.stats.hitting}</div>
                  <div>POW: {promotionCandidate.stats.power}</div>
                  <div>SPD: {promotionCandidate.stats.speed}</div>
                  <div>DEF: {promotionCandidate.stats.defense}</div>
                </>
              ) : (
                <>
                  <div>PIT: {promotionCandidate.stats.pitching}</div>
                  <div>DEF: {promotionCandidate.stats.defense}</div>
                  <div></div>
                  <div></div>
                </>
              )}
            </div>
            <div className="text-xs text-amber-400 mt-2">
              POTENTIAL: {promotionCandidate.potential}
            </div>
          </div>
        </div>

        {/* Current Roster - Select to Cut */}
        <div className="border-4 border-green-400 p-4 mb-6">
          <div className="text-amber-400 mb-3">SELECT PLAYER TO CUT (MUST MAINTAIN: 9 POSITION + 5 PITCHERS):</div>
          <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
            {myTeam.roster
              .filter(p => p.type === promotionCandidate.type)
              .map((player) => (
                <div
                  key={player.id}
                  onClick={() => setSelectedToCut(player)}
                  className={`border-2 p-3 cursor-pointer ${
                    selectedToCut?.id === player.id 
                      ? 'bg-red-900 border-red-400' 
                      : 'border-green-400 hover:bg-green-900'
                  }`}
                >
                  <div className="flex justify-between mb-2">
                    <span>{player.name}</span>
                    <span>[{player.type === 'position' ? 'POS' : 'PIT'}]</span>
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
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              setPromotionCandidate(null);
              setSelectedToCut(null);
              setView('minor-league');
            }}
            className="py-3 border-4 border-green-400 hover:bg-green-400 hover:text-black"
          >
            {'<'} CANCEL_
          </button>
          <button
            onClick={executePromotion}
            disabled={!selectedToCut}
            className={`py-3 border-4 border-green-400 ${
              selectedToCut 
                ? 'hover:bg-green-400 hover:text-black' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {'>'} CONFIRM PROMOTION_
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoteProspectView;

