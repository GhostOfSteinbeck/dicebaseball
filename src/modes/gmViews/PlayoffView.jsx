import React from 'react';

const PlayoffView = ({ playoffState, setPlayoffState, season, startDraft, setView, simulatePlayoffGame }) => {
  if (!playoffState) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-amber-900">Loading Playoff Data...</div>
      </div>
    );
  }

  const advancePlayoffs = () => {
    if (playoffState.round === 'semifinals') {
      // Simulate both semifinal games
      const newResults = [...playoffState.results];
      
      // Game 1: 1 vs 4
      const game1Result = playoffState.bracket[0].simulate();
      newResults.push({
        round: 'semifinals',
        team1: playoffState.bracket[0].team1,
        team2: playoffState.bracket[0].team2,
        team1Score: game1Result.team1Score,
        team2Score: game1Result.team2Score,
        winner: game1Result.team1Score > game1Result.team2Score 
          ? playoffState.bracket[0].team1 
          : playoffState.bracket[0].team2
      });
      
      // Game 2: 2 vs 3
      const game2Result = playoffState.bracket[1].simulate();
      newResults.push({
        round: 'semifinals',
        team1: playoffState.bracket[1].team1,
        team2: playoffState.bracket[1].team2,
        team1Score: game2Result.team1Score,
        team2Score: game2Result.team2Score,
        winner: game2Result.team1Score > game2Result.team2Score 
          ? playoffState.bracket[1].team1 
          : playoffState.bracket[1].team2
      });
      
      // Get winners for championship
      const semifinal1Winner = newResults[newResults.length - 2].winner;
      const semifinal2Winner = newResults[newResults.length - 1].winner;
      
      // Move to championship round
      setPlayoffState({
        round: 'championship',
        bracket: [{
          team1: semifinal1Winner,
          team2: semifinal2Winner,
          simulate: () => simulatePlayoffGame(semifinal1Winner, semifinal2Winner)
        }],
        semifinalBracket: playoffState.bracket, // Preserve original semifinal bracket for display
        results: newResults
      });
    } else if (playoffState.round === 'championship') {
      // Simulate championship game
      const gameResult = playoffState.bracket[0].simulate();
      const winner = gameResult.team1Score > gameResult.team2Score 
        ? playoffState.bracket[0].team1 
        : playoffState.bracket[0].team2;
      
      const newResults = [...playoffState.results, {
        round: 'championship',
        team1: playoffState.bracket[0].team1,
        team2: playoffState.bracket[0].team2,
        team1Score: gameResult.team1Score,
        team2Score: gameResult.team2Score,
        winner: winner
      }];
      
      // Mark playoffs as complete
      setPlayoffState({
        round: 'complete',
        bracket: playoffState.bracket,
        semifinalBracket: playoffState.semifinalBracket, // Preserve semifinal bracket
        results: newResults
      });
    }
  };

  const getSemifinalResults = () => {
    // Use semifinalBracket if available (championship/complete rounds), otherwise use bracket
    const bracketToUse = playoffState.semifinalBracket || playoffState.bracket;
    
    if (!bracketToUse || bracketToUse.length < 2) {
      return [undefined, undefined];
    }
    
    const semifinalResults = playoffState.results.filter(r => r.round === 'semifinals');
    // Match results to bracket order
    const game1Result = bracketToUse[0] ? semifinalResults.find(r => 
      (r.team1.name === bracketToUse[0].team1.name && r.team2.name === bracketToUse[0].team2.name) ||
      (r.team1.name === bracketToUse[0].team2.name && r.team2.name === bracketToUse[0].team1.name)
    ) : undefined;
    const game2Result = bracketToUse[1] ? semifinalResults.find(r => 
      (r.team1.name === bracketToUse[1].team1.name && r.team2.name === bracketToUse[1].team2.name) ||
      (r.team1.name === bracketToUse[1].team2.name && r.team2.name === bracketToUse[1].team1.name)
    ) : undefined;
    return [game1Result, game2Result];
  };

  const getChampionshipResult = () => {
    return playoffState.results.find(r => r.round === 'championship');
  };

  const semifinalResults = getSemifinalResults();
  const championshipResult = getChampionshipResult();
  // Use semifinalBracket if available (championship/complete rounds), otherwise use bracket
  const semifinalBracket = playoffState.semifinalBracket || playoffState.bracket;

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 font-mono">
      <div className="max-w-6xl mx-auto">
        
        <div className="border-4 border-green-400 p-6 mb-6">
          <pre className="text-center text-2xl">
{`╔════════════════════════════════════════╗
║         PLAYOFFS - YEAR ${season.year}          ║
║        CHAMPIONSHIP BRACKET            ║
╚════════════════════════════════════════╝`}
          </pre>
        </div>

        {/* Bracket Display */}
        <div className="border-4 border-green-400 p-6 mb-6">
          <div className="text-amber-400 mb-4 text-center text-xl">PLAYOFF BRACKET</div>
          
          {/* Semifinals */}
          <div className="mb-6">
            <div className="text-green-300 mb-3 text-center font-bold">SEMIFINALS</div>
            <div className="grid grid-cols-2 gap-4">
              {/* Game 1: 1 vs 4 */}
              <div className="border-2 border-green-400 p-4">
                <div className="text-xs mb-2 text-center">#1 vs #4</div>
                {playoffState.round === 'semifinals' && !semifinalResults[0] && semifinalBracket && semifinalBracket[0] ? (
                  <div className="text-center">
                    <div className="mb-2">{semifinalBracket[0].team1.city} {semifinalBracket[0].team1.name}</div>
                    <div className="text-xs mb-2">vs</div>
                    <div>{semifinalBracket[0].team2.city} {semifinalBracket[0].team2.name}</div>
                  </div>
                ) : semifinalResults[0] && semifinalBracket && semifinalBracket[0] ? (
                  <div className="text-center">
                    <div className={`mb-1 ${semifinalResults[0].winner.name === semifinalBracket[0].team1.name ? 'text-amber-400 font-bold' : ''}`}>
                      {semifinalBracket[0].team1.city} {semifinalBracket[0].team1.name} {semifinalResults[0].team1Score}
                    </div>
                    <div className={`mb-1 ${semifinalResults[0].winner.name === semifinalBracket[0].team2.name ? 'text-amber-400 font-bold' : ''}`}>
                      {semifinalBracket[0].team2.city} {semifinalBracket[0].team2.name} {semifinalResults[0].team2Score}
                    </div>
                    <div className="text-xs text-amber-400 mt-2">
                      Winner: {semifinalResults[0].winner.city} {semifinalResults[0].winner.name}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Game 2: 2 vs 3 */}
              <div className="border-2 border-green-400 p-4">
                <div className="text-xs mb-2 text-center">#2 vs #3</div>
                {playoffState.round === 'semifinals' && !semifinalResults[1] && semifinalBracket && semifinalBracket[1] ? (
                  <div className="text-center">
                    <div className="mb-2">{semifinalBracket[1].team1.city} {semifinalBracket[1].team1.name}</div>
                    <div className="text-xs mb-2">vs</div>
                    <div>{semifinalBracket[1].team2.city} {semifinalBracket[1].team2.name}</div>
                  </div>
                ) : semifinalResults[1] && semifinalBracket && semifinalBracket[1] ? (
                  <div className="text-center">
                    <div className={`mb-1 ${semifinalResults[1].winner.name === semifinalBracket[1].team1.name ? 'text-amber-400 font-bold' : ''}`}>
                      {semifinalBracket[1].team1.city} {semifinalBracket[1].team1.name} {semifinalResults[1].team1Score}
                    </div>
                    <div className={`mb-1 ${semifinalResults[1].winner.name === semifinalBracket[1].team2.name ? 'text-amber-400 font-bold' : ''}`}>
                      {semifinalBracket[1].team2.city} {semifinalBracket[1].team2.name} {semifinalResults[1].team2Score}
                    </div>
                    <div className="text-xs text-amber-400 mt-2">
                      Winner: {semifinalResults[1].winner.city} {semifinalResults[1].winner.name}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Championship */}
          {(playoffState.round === 'championship' || playoffState.round === 'complete') && (
            <div className="border-t-4 border-green-400 pt-6">
              <div className="text-green-300 mb-3 text-center font-bold">CHAMPIONSHIP</div>
              <div className="border-2 border-amber-400 p-4">
                {!championshipResult ? (
                  <div className="text-center">
                    <div className="mb-2">{playoffState.bracket[0].team1.city} {playoffState.bracket[0].team1.name}</div>
                    <div className="text-xs mb-2">vs</div>
                    <div>{playoffState.bracket[0].team2.city} {playoffState.bracket[0].team2.name}</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className={`mb-1 text-lg ${championshipResult.winner.name === championshipResult.team1.name ? 'text-amber-400 font-bold' : ''}`}>
                      {championshipResult.team1.city} {championshipResult.team1.name} {championshipResult.team1Score}
                    </div>
                    <div className={`mb-1 text-lg ${championshipResult.winner.name === championshipResult.team2.name ? 'text-amber-400 font-bold' : ''}`}>
                      {championshipResult.team2.city} {championshipResult.team2.name} {championshipResult.team2Score}
                    </div>
                    <div className="text-xl text-amber-400 mt-4 font-bold">
                      🏆 CHAMPION: {championshipResult.winner.city} {championshipResult.winner.name} 🏆
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          {playoffState.round !== 'complete' ? (
            <button
              onClick={advancePlayoffs}
              className="py-4 border-4 border-green-400 hover:bg-green-400 hover:text-black"
            >
              {'>'} SIMULATE {playoffState.round === 'semifinals' ? 'SEMIFINALS' : 'CHAMPIONSHIP'}_
            </button>
          ) : (
            <button
              onClick={startDraft}
              className="py-4 border-4 border-green-400 hover:bg-green-400 hover:text-black"
            >
              {'>'} BEGIN YEAR {season.year + 1} DRAFT_
            </button>
          )}
          
          <button
            onClick={() => {
              if (playoffState.round === 'complete') {
                startDraft();
              } else {
                setView('season-end');
              }
            }}
            className="py-4 border-4 border-green-400 hover:bg-green-400 hover:text-black"
          >
            {'<'} BACK_
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayoffView;

