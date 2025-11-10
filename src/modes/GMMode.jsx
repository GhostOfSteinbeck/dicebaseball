import React, { useState, useEffect } from 'react';
import { DiceEngine, GAME_CONFIG } from '../engine/gameEngine';
import * as gmUtils from './gmUtils';
import { simulateScheduledGames, runSingleSimulation, generatePlayerPerformance } from './gmGameSimulation';

// Import all view components
import DraftView from './gmViews/DraftView';
import LineupView from './gmViews/LineupView';
import HubView from './gmViews/HubView';
import RosterView from './gmViews/RosterView';
import StandingsView from './gmViews/StandingsView';
import MinorLeagueView from './gmViews/MinorLeagueView';
import FreeAgentPoolView from './gmViews/FreeAgentPoolView';
import PromoteProspectView from './gmViews/PromoteProspectView';
import SeasonEndView from './gmViews/SeasonEndView';
import SeasonStatsView from './gmViews/SeasonStatsView';

const GMMode = ({ selectedTeam, universe, onExit }) => {
  const [engine] = useState(() => new DiceEngine());
  const [view, setView] = useState('hub');
  const [myTeam, setMyTeam] = useState(null);
  const [draftState, setDraftState] = useState(null);
  const [season, setSeason] = useState({ 
    gamesPlayed: 0, 
    totalGames: GAME_CONFIG.gm.seasonGames,
    year: 1,
    schedule: [], // Will be array of rounds, each round has 4 matchup pairs
    seasonEnded: false, // Track if season just ended for draft trigger
    pitcherRotationIndex: 0 // Track which pitcher starts (0-4, rotates for 4 starts each)
  });
  const [gameResult, setGameResult] = useState(null);
  const [lineup, setLineup] = useState({
    C: null, '1B': null, '2B': null, '3B': null, SS: null,
    LF: null, CF: null, RF: null, DH: null
  });
  const [promotionCandidate, setPromotionCandidate] = useState(null);
  const [selectedToCut, setSelectedToCut] = useState(null);
  const [selectedFreeAgent, setSelectedFreeAgent] = useState(null);
  const [selectedToReplace, setSelectedToReplace] = useState(null);

  // Initialize from universe
  useEffect(() => {
    if (selectedTeam && universe.league) {
      const team = universe.league.find(t => t.name === selectedTeam.name);
      if (team) {
        setMyTeam(team);
        
        // Generate complete league schedule
        const newSchedule = gmUtils.generateFullLeagueSchedule();
        setSeason(prev => ({ ...prev, schedule: newSchedule }));
      } else {
        console.error('Team not found in universe:', selectedTeam.name);
      }
    }
  }, [selectedTeam, universe]);

  // ============================================================================
  // DRAFT HANDLERS
  // ============================================================================

  const startDraft = () => {
    const prospects = gmUtils.generateProspects();
    // Reverse standings order: worst team picks first
    const standings = universe.getStandings();
    const draftOrder = [...standings].reverse(); // Last place picks #1
    
    setDraftState({
      prospects,
      draftOrder,
      currentPick: 0,
      round: 1,
      picks: []
    });
    
    // Clear season ended flag
    setSeason(prev => ({ ...prev, seasonEnded: false }));
    
    setView('draft');
  };

  const makePick = (prospect) => {
    const currentTeam = draftState.draftOrder[draftState.currentPick % 8];
    const newPicks = [...draftState.picks, { team: currentTeam.name, player: prospect }];
    const newProspects = draftState.prospects.filter(p => p.id !== prospect.id);
    
    let nextPick = draftState.currentPick + 1;
    let nextRound = nextPick >= 8 ? 2 : 1;
    
    setDraftState({
      ...draftState,
      prospects: newProspects,
      currentPick: nextPick,
      round: nextRound,
      picks: newPicks
    });
    
    // Draft complete - Smart minor league management (keep best 5 prospects)
    if (nextPick >= 16) {
      // Update universe directly
      universe.league.forEach(team => {
        const teamPicks = newPicks
          .filter(p => p.team === team.name)
          .map(p => p.player);
        
        // Combine existing minor league with new picks
        const allProspects = [...(team.minorLeague || []), ...teamPicks];
        
        // Sort by evaluation score and keep only top 5
        const sortedProspects = allProspects.sort((a, b) => gmUtils.evaluateProspect(b) - gmUtils.evaluateProspect(a));
        team.minorLeague = sortedProspects.slice(0, 5);
        
        // Reset records for new season
        team.record.wins = 0;
        team.record.losses = 0;
        
        // All other prospects are deleted (not added to roster)
        console.log(`Team ${team.name}: Kept ${team.minorLeague.length} prospects, deleted ${allProspects.length - 5} others`);
      });
      
      // Calculate salaries for all players based on end-of-season stats
      universe.league.forEach(team => {
        team.roster.forEach(player => {
          player.salary = gmUtils.calculateSalary(player);
        });
      });
      
      // Enforce salary cap for all teams and collect dropped players
      const allDroppedPlayers = [];
      universe.league.forEach(team => {
        const droppedPlayers = gmUtils.enforceSalaryCap(team);
        allDroppedPlayers.push(...droppedPlayers);
      });
      
      // Create free agent pool: top 10 highest salaried dropped players
      const sortedDropped = allDroppedPlayers.sort((a, b) => {
        const aSalary = a.salary || gmUtils.calculateSalary(a);
        const bSalary = b.salary || gmUtils.calculateSalary(b);
        return gmUtils.salaryToValue(bSalary) - gmUtils.salaryToValue(aSalary);
      });
      universe.freeAgentPool = sortedDropped.slice(0, 10);
      
      // Update myTeam reference
      const updatedTeam = universe.league.find(t => t.name === myTeam.name);
      setMyTeam(updatedTeam);
      
      // Generate new schedule for the new season
      const newSchedule = gmUtils.generateFullLeagueSchedule();
      
      // Adjust player stats for new season (aging)
      gmUtils.adjustPlayerStatsForNewSeason(universe);
      
      // Start new season (reset pitcher rotation)
      setSeason({
        gamesPlayed: 0,
        totalGames: GAME_CONFIG.gm.seasonGames,
        year: season.year + 1,
        schedule: newSchedule,
        seasonEnded: false,
        pitcherRotationIndex: 0 // Reset rotation each season
      });
      
      setView('hub');
    }
  };

  // ============================================================================
  // LINEUP HANDLERS
  // ============================================================================

  const assignPosition = (position, player) => {
    const newLineup = { ...lineup };
    Object.keys(newLineup).forEach(pos => {
      if (newLineup[pos]?.id === player.id) {
        newLineup[pos] = null;
      }
    });
    newLineup[position] = player;
    setLineup(newLineup);
  };

  const removeFromPosition = (position) => {
    setLineup({ ...lineup, [position]: null });
  };

  // ============================================================================
  // GAME SIMULATION HANDLERS
  // ============================================================================

  const simulateGame = () => {
    // Clear season ended flag when starting new season
    if (season.seasonEnded) {
      setSeason(prev => ({ ...prev, seasonEnded: false }));
    }
    
    // Get all games for this round and simulate them
    const playerMatchup = simulateScheduledGames(season.gamesPlayed, season, universe, myTeam);
    
    if (!playerMatchup) {
      console.error('Could not find player matchup for round', season.gamesPlayed);
      return;
    }
    
    // Determine opponent (the team that isn't myTeam)
    const opponent = playerMatchup.team1.name === myTeam.name ? playerMatchup.team2 : playerMatchup.team1;
    
    // Get current pitcher rotation index (0-4, each pitcher gets 4 starts)
    const myPitcherIndex = season.pitcherRotationIndex % 5;
    const oppPitcherIndex = season.gamesPlayed % 5; // Opponent also rotates
    
    // Run 3 simulations for player's game, take median result
    const sims = [
      runSingleSimulation(myTeam, opponent, myPitcherIndex, oppPitcherIndex, lineup, myTeam),
      runSingleSimulation(myTeam, opponent, myPitcherIndex, oppPitcherIndex, lineup, myTeam),
      runSingleSimulation(myTeam, opponent, myPitcherIndex, oppPitcherIndex, lineup, myTeam)
    ];
    
    // Pick the median result
    sims.sort((a, b) => (a.team1Score + a.team2Score) - (b.team1Score + b.team2Score));
    const result = sims[1];
    
    const yourScore = result.team1Score;
    const oppScore = result.team2Score;
    const won = yourScore > oppScore;
    
    // Generate player of the game if won
    let playerOfTheGame = null;
    if (won) {
      const lineupPlayers = Object.values(lineup).filter(p => p !== null);
      if (lineupPlayers.length > 0) {
        const randomPlayer = lineupPlayers[Math.floor(Math.random() * lineupPlayers.length)];
        const performance = generatePlayerPerformance(randomPlayer);
        playerOfTheGame = {
          player: randomPlayer,
          performance: performance
        };
      }
    }
    
    // Update records using universe method
    if (won) {
      universe.recordGame(myTeam.name, opponent.name);
    } else {
      universe.recordGame(opponent.name, myTeam.name);
    }
    
    // Update myTeam reference
    setMyTeam(universe.league.find(t => t.name === myTeam.name));
    
    const newGamesPlayed = season.gamesPlayed + 1;
    
    // Check if season is over
    if (newGamesPlayed >= season.totalGames) {
      // Store final standings before reset
      setSeason({ 
        gamesPlayed: newGamesPlayed, 
        totalGames: season.totalGames, 
        year: season.year,
        schedule: season.schedule,
        seasonEnded: true
      });
      setGameResult({ opponent: opponent.name, yourScore, oppScore, won, seasonOver: true, playerOfTheGame });
      // Go to mandatory season-end screen
      setView('season-end');
    } else {
      // Advance pitcher rotation for next game
      const nextPitcherIndex = (season.pitcherRotationIndex + 1) % 5;
      setSeason({ ...season, gamesPlayed: newGamesPlayed, pitcherRotationIndex: nextPitcherIndex });
      setGameResult({ opponent: opponent.name, yourScore, oppScore, won, seasonOver: false, playerOfTheGame });
      // Stay on hub view, show result overlay
      setView('hub');
    }
  };

  // ============================================================================
  // VIEW ROUTING
  // ============================================================================

  // Don't render until myTeam is loaded
  if (!myTeam) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 flex items-center justify-center">
        <div className="text-2xl font-bold text-amber-900">Loading Team Data...</div>
      </div>
    );
  }

  switch (view) {
    case 'draft':
      return (
        <DraftView
          draftState={draftState}
          myTeam={myTeam}
          season={season}
          makePick={makePick}
          startDraft={startDraft}
        />
      );

    case 'lineup':
      return (
        <LineupView
          myTeam={myTeam}
          lineup={lineup}
          assignPosition={assignPosition}
          removeFromPosition={removeFromPosition}
          setView={setView}
        />
      );

    case 'hub':
      return (
        <HubView
          myTeam={myTeam}
          season={season}
          gameResult={gameResult}
          setGameResult={setGameResult}
          simulateGame={simulateGame}
          universe={universe}
          onExit={onExit}
          setView={setView}
        />
      );

    case 'roster':
      return (
        <RosterView
          myTeam={myTeam}
          season={season}
          lineup={lineup}
          setView={setView}
        />
      );

    case 'standings':
      return (
        <StandingsView
          universe={universe}
          myTeam={myTeam}
          season={season}
          setView={setView}
        />
      );

    case 'minor-league':
      return (
        <MinorLeagueView
          myTeam={myTeam}
          setPromotionCandidate={setPromotionCandidate}
          setView={setView}
        />
      );

    case 'free-agent-pool':
      return (
        <FreeAgentPoolView
          myTeam={myTeam}
          universe={universe}
          selectedFreeAgent={selectedFreeAgent}
          setSelectedFreeAgent={setSelectedFreeAgent}
          selectedToReplace={selectedToReplace}
          setSelectedToReplace={setSelectedToReplace}
          setView={setView}
          setMyTeam={setMyTeam}
        />
      );

    case 'promote-prospect':
      return (
        <PromoteProspectView
          myTeam={myTeam}
          universe={universe}
          promotionCandidate={promotionCandidate}
          selectedToCut={selectedToCut}
          setSelectedToCut={setSelectedToCut}
          setView={setView}
          setMyTeam={setMyTeam}
          setPromotionCandidate={setPromotionCandidate}
        />
      );

    case 'season-end':
      return (
        <SeasonEndView
          myTeam={myTeam}
          universe={universe}
          season={season}
          startDraft={startDraft}
          setView={setView}
        />
      );

    case 'season-stats':
      return (
        <SeasonStatsView
          myTeam={myTeam}
          season={season}
          setView={setView}
        />
      );

    default:
      return (
        <HubView
          myTeam={myTeam}
          season={season}
          gameResult={gameResult}
          setGameResult={setGameResult}
          simulateGame={simulateGame}
          universe={universe}
          onExit={onExit}
          setView={setView}
        />
      );
  }
};

export default GMMode;
