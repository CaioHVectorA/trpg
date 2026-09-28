'use client';

import React from 'react';
import { DiceProvider } from '@/components/dice/DiceContext';
import { DiceRollerBar } from '@/components/dice/DiceRollerBar';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DiceProvider>
      {children}
      <DiceRollerBar />
    </DiceProvider>
  );
};
