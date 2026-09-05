import React from 'react';
import { DOJO_NAMES, DOJO_COLOR_MAP, PLAYER_COLOR_MAP } from '../types';
import type { DojoName, FocusCell, GameState } from '../types';
import TierDisplay from './TierDisplay';
import { useCountUp } from '../hooks/useCountUp';

interface AnimatedValueProps {
  value: number;
  prefix?: string;
  className?: string;
}

function AnimatedValue({ value, prefix = '', className = '' }: AnimatedValueProps) {
  const displayValue = useCountUp(value);
  return <span className={className}>{prefix}{displayValue.toLocaleString()}</span>;
}

interface InvestmentTableProps {
  state: GameState;
  focus: FocusCell;
  setFocus: (focus: FocusCell) => void;
  handlePlayerHeaderClick: (pIdx: number) => void;
  roundNumber: number;
  totalRounds: number;
  changingRound: number | null;
  getTotalInvestment: (dojo: DojoName) => number;
}

export default function InvestmentTable({
  state, focus, setFocus, handlePlayerHeaderClick, roundNumber, totalRounds, changingRound, getTotalInvestment
}: InvestmentTableProps) {
  const getDojoFilename = (name: string) => name.toLowerCase().replace(/\s+/g, '');

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="header-cell dojo-header">Dojo</th>
            <th className="header-cell tier-header">Tier</th>
            <th className="header-cell">Total</th>
            {state.players.map((player, i) => {
              const isHeaderFocused = focus.type === 'header' && focus.playerIndex === i;
              const color = PLAYER_COLOR_MAP[player.color] || 'cyan';

              let tierSum = 0;
              DOJO_NAMES.forEach(dojoName => {
                if (state.majorityInvestors[dojoName] === i) {
                  tierSum += state.dojoTiers[dojoName];
                }
              });

              return (
                <th 
                  key={`player-header-${i}`} 
                  className={`header-cell player-header ${isHeaderFocused ? 'cell-focus' : ''}`}
                  onClick={() => {
                    if (roundNumber <= totalRounds && changingRound === null) handlePlayerHeaderClick(i);
                  }}
                  style={{ color: color, '--dojo-color': color } as React.CSSProperties}
                >
                  <div className="player-header-content">
                    <span className="player-name-text" title={player.name}>
                      {player.name}
                    </span>
                    {/* Unique combined key to force animation restarts while remaining safe */}
                    <div key={`player-${i}-${tierSum}`} className="player-score-badge">
                      {tierSum}
                    </div>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {DOJO_NAMES.map((dojoName, hIdx) => {
            const isFocused = (pIdx: number) => focus.type === 'investment' && focus.dojoIndex === hIdx && focus.playerIndex === pIdx;
            const tier = state.dojoTiers[dojoName];
            
            let dojoImageSrc = '';
            if (tier === 1) dojoImageSrc = `/tier/${getDojoFilename(dojoName)}1.png`;
            else if (tier === 2) dojoImageSrc = `/tier/${getDojoFilename(dojoName)}2.png`;
            else if (tier === 3) dojoImageSrc = `/tier/${getDojoFilename(dojoName)}3.png`;

            const investments = state.investments[dojoName];

            return (
              <tr key={dojoName} style={{ backgroundColor: `${DOJO_COLOR_MAP[dojoName]}3D` }}>
                <td className="data-cell dojo-name-cell" style={{ '--dojo-color': DOJO_COLOR_MAP[dojoName] } as React.CSSProperties}>
                  {dojoName} 
                </td>
                <td className="data-cell tier-cell">
                  <TierDisplay tier={tier} />
                </td>
                <td className="data-cell">
                  <div className="value-box total-inv">
                    <AnimatedValue value={getTotalInvestment(dojoName)} prefix="$" className="value-text" />
                  </div>
                </td>
                {state.players.map((player, pIdx) => {
                  const investmentValue = investments[pIdx];
                  const isMajority = state.majorityInvestors[dojoName] === pIdx;
                  const pColorHex = PLAYER_COLOR_MAP[player.color] || '#0fff50';
                  
                  const playerStyle = {
                    '--player-color': pColorHex,
                    '--player-color-bg': `${pColorHex}F3`,
                    '--player-color-glow': `${pColorHex}33`,
                  } as React.CSSProperties;

                  return (
                    <td 
                      key={`investment-${pIdx}`}
                      className={`data-cell investment-cell ${isFocused(pIdx) ? 'cell-focus' : ''}`}
                      onClick={() => {
                        if (roundNumber <= totalRounds && changingRound === null) setFocus({ dojoIndex: hIdx, type: 'investment', playerIndex: pIdx });
                      }}
                    >
                      <div className={`value-box player-inv ${isMajority ? 'majority-investor' : ''}`} style={playerStyle}>
                          <AnimatedValue value={investmentValue} prefix="$" className="value-text" />
                          {isMajority && (
                            <div className={`majority-tier-badge ${tier === 0 ? 'text-badge' : ''}`}>
                              {tier > 0 ? <img src={`/banners/${tier}.png`} alt={`Tier ${tier}`} /> : tier}
                            </div>
                          )}
                          {isMajority && dojoImageSrc && (
                            <div className="majority-dojo-badge">
                              <img src={dojoImageSrc} alt="Dojo Badge" />
                            </div>
                          )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

