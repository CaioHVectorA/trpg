'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { DiceEngine } from '@/lib/dice';
import { DiceRollRequest, DiceRollResult } from '@/lib/types';
import { DiceRollModal } from './DiceRollModal';

export interface RollOptions {
  showModal?: boolean;
  persist?: boolean;
  senderName?: string;
  rollType?: string;
  campaignId?: string;
  characterId?: string;
}

interface DiceContextType {
  recentRolls: DiceRollResult[];
  lastRoll: DiceRollResult | null;
  activeModalRoll: DiceRollResult | null;
  setActiveModalRoll: (roll: DiceRollResult | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  isOpen: boolean; // DiceRollerBar drawer open state
  setIsOpen: (open: boolean) => void;
  roll: (req: DiceRollRequest, options?: RollOptions) => DiceRollResult;
  clearHistory: () => void;
}

const DiceContext = createContext<DiceContextType | undefined>(undefined);

export const DiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentRolls, setRecentRolls] = useState<DiceRollResult[]>([]);
  const [lastRoll, setLastRoll] = useState<DiceRollResult | null>(null);
  const [activeModalRoll, setActiveModalRoll] = useState<DiceRollResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load rolls from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trpg_recent_rolls');
      if (saved) {
        setRecentRolls(JSON.parse(saved));
      }
    } catch {
      // ignore local storage error in non-browser or sandboxed environments
    }
  }, []);

  const roll = useCallback((req: DiceRollRequest, options?: RollOptions): DiceRollResult => {
    const result = DiceEngine.roll(req);
    setLastRoll(result);

    setRecentRolls((prev) => {
      const updated = [result, ...prev.slice(0, 49)];
      try {
        localStorage.setItem('trpg_recent_rolls', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    if (options?.showModal !== false) {
      setActiveModalRoll(result);
      setIsModalOpen(true);
    }

    // Persist roll to API in background if enabled
    if (options?.persist !== false && typeof fetch !== 'undefined') {
      fetch('/api/rolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expression: req.formula,
          total: result.total,
          diceBreakdown: JSON.stringify(result.rolls),
          isCrit: result.isCriticalHit,
          isFumble: result.isFumble,
          threatMargin: req.threatRange || 20,
          label: result.label,
          senderName: options?.senderName || 'Jogador',
          rollType: options?.rollType || 'CUSTOM',
          system: req.system || 'T20',
          campaignId: options?.campaignId,
          characterId: options?.characterId
        })
      }).catch((err) => {
        // Safe catch for offline / mock test execution
        console.warn('Persistência da rolagem falhou:', err);
      });
    }

    return result;
  }, []);

  const clearHistory = useCallback(() => {
    setRecentRolls([]);
    setLastRoll(null);
    setActiveModalRoll(null);
    try {
      localStorage.removeItem('trpg_recent_rolls');
    } catch {
      // ignore
    }
  }, []);

  return (
    <DiceContext.Provider
      value={{
        recentRolls,
        lastRoll,
        activeModalRoll,
        setActiveModalRoll,
        isModalOpen,
        setIsModalOpen,
        isOpen,
        setIsOpen,
        roll,
        clearHistory
      }}
    >
      {children}
      {/* Global Visual Reveal Modal */}
      <DiceRollModal
        roll={activeModalRoll}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </DiceContext.Provider>
  );
};

export const useDice = (): DiceContextType => {
  const context = useContext(DiceContext);
  if (!context) {
    throw new Error('useDice must be used within a DiceProvider');
  }
  return context;
};
