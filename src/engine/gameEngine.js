// ============================================================================
// GAME ENGINE - Single source of truth for all game rules
// ============================================================================

export const GAME_CONFIG = {
  outcomes: {
    strikeout: { max: -8 },
    groundout: { min: -7, max: -3 },
    flyout: { min: -2, max: 1 },
    lineDriveCaught: { min: 2, max: 4 },
    single: { min: 5, max: 10 },
    double: { min: 11, max: 14 },
    triple: { exact: 15 },
    homeRun: { min: 16 }
  },
  xp: {
    single: 1,
    double: 2,
    triple: 2,
    homerun: 3,
    upgradeCost: 10,
    lateBloomCost: 8
  },
  career: {
    gamesPerSeason: 20,
    atBatsPerGame: 4,
    lockerRoomInterval: 5
  },
  gm: {
    seasonGames: 20,
    rosterSize: 14
  }
};

export class DiceEngine {
  d20 = () => Math.floor(Math.random() * 20) + 1;

  getModifier(stat) {
    if (stat >= 90) return 5;
    if (stat >= 80) return 4;
    if (stat >= 70) return 3;
    if (stat >= 60) return 2;
    if (stat >= 50) return 1;
    return -1;
  }

  resolveAtBat(batter, pitcher, bonuses = {}) {
    const batterRoll = this.d20();
    const pitcherRoll = this.d20();
    
    const batterMod = this.getModifier(batter.hitting || batter.stats?.hitting || 50) + (bonuses.momentum || 0);
    const pitcherMod = this.getModifier(pitcher.pitching || pitcher.stats?.pitching || 50);
    
    const margin = (batterRoll + batterMod) - (pitcherRoll + pitcherMod);
    
    let outcome = '';
    let isOut = true;
    let hitType = null;
    
    if (margin <= -8) {
      outcome = 'STRIKEOUT!';
    } else if (margin <= -3) {
      outcome = 'Groundout';
    } else if (margin <= 1) {
      outcome = 'Flyout';
    } else if (margin <= 4) {
      outcome = 'Line drive - caught';
    } else if (margin <= 10) {
      outcome = 'SINGLE!';
      isOut = false;
      hitType = 'single';
    } else if (margin <= 14) {
      outcome = 'DOUBLE!';
      isOut = false;
      hitType = 'double';
    } else if (margin === 15) {
      outcome = 'TRIPLE!';
      isOut = false;
      hitType = 'triple';
    } else {
      outcome = 'HOME RUN!';
      isOut = false;
      hitType = 'homerun';
    }
    
    return {
      outcome,
      isOut,
      hitType,
      batterRoll,
      pitcherRoll,
      margin,
      batterMod,
      pitcherMod
    };
  }
}