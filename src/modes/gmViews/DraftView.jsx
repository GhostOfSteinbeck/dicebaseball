import React from 'react';

const DraftView = ({ draftState, myTeam, season, makePick, startDraft }) => {
  if (!draftState) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
        <div className="max-w-4xl mx-auto border-4 border-green-400 p-6">
          <pre className="text-center mb-6 text-xl">
{`╔════════════════════════════════════════╗
║    DRAFT DAY PROTOCOL v1.0 - YEAR ${season.year}   ║
║      [ADD 2 PLAYERS TO ROSTER]         ║
╚════════════════════════════════════════╝`}
          </pre>
          
          <div className="mb-6 text-center">
            <div className="mb-2">SYSTEM: 20 prospects available</div>
            <div className="mb-2">FORMAT: 2 rounds, 8 teams</div>
            <div>OBJECTIVE: Select 2 new players</div>
          </div>
          
          <button
            onClick={startDraft}
            className="w-full py-4 text-xl border-4 border-green-400 bg-black hover:bg-green-400 hover:text-black"
          >
            {'>'} INITIALIZE DRAFT SEQUENCE_
          </button>
        </div>
      </div>
    );
  }

  const currentTeam = draftState.draftOrder[draftState.currentPick % 8];
  const isYourPick = currentTeam.name === myTeam.name;

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        <div className="border-4 border-green-400 p-4 mb-4">
          <div className="text-center">
            <div>DRAFT STATUS: ROUND {draftState.round} | PICK {(draftState.currentPick % 8) + 1}</div>
            <div className="text-amber-400 mt-2">
              {isYourPick ? '>>> YOUR SELECTION <<<' : `WAITING: ${currentTeam.name}`}
            </div>
          </div>
        </div>

        {!isYourPick && (
          <div className="text-center mb-4">
            <button
              onClick={() => makePick(draftState.prospects[0])}
              className="px-6 py-2 border-2 border-green-400 hover:bg-green-400 hover:text-black"
            >
              {'>'} SIMULATE CPU PICK_
            </button>
          </div>
        )}

        {isYourPick && (
          <div className="border-4 border-green-400 p-4">
            <div className="mb-4">AVAILABLE PROSPECTS:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
              {draftState.prospects.map((prospect) => (
                <div
                  key={prospect.id}
                  onClick={() => makePick(prospect)}
                  className="border-2 border-green-400 p-3 cursor-pointer hover:bg-green-400 hover:text-black"
                >
                  <div className="flex justify-between mb-2">
                    <span>{prospect.name}</span>
                    <span>[{prospect.type === 'position' ? 'POS' : 'PIT'}]</span>
                  </div>
                  <div className="text-xs grid grid-cols-4 gap-2">
                    {prospect.type === 'position' ? (
                      <>
                        <div>HIT: {prospect.stats.hitting}</div>
                        <div>POW: {prospect.stats.power}</div>
                        <div>SPD: {prospect.stats.speed}</div>
                        <div>DEF: {prospect.stats.defense}</div>
                      </>
                    ) : (
                      <>
                        <div>PIT: {prospect.stats.pitching}</div>
                        <div>DEF: {prospect.stats.defense}</div>
                        <div></div>
                        <div></div>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-amber-400 mt-1">
                    POTENTIAL: {prospect.potential}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftView;

