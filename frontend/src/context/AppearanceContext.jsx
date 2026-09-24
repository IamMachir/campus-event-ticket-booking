import { createContext, useContext, useEffect, useState } from 'react';

export const APPEARANCE_OPTIONS = [
  {
    value: 'default',
    label: 'Default',
    description: 'The original CampusEvents theme with ASTU colors and soft glow effects.',
  },
  {
    value: 'dark',
    label: 'Dark mode',
    description: 'A deeper, low-light theme for comfortable viewing at night.',
  },
  {
    value: 'white',
    label: 'White mode',
    description: 'A bright, high-contrast theme for daytime use and easier reading.',
  },
];

const STORAGE_KEY = 'campus-events-appearance';
const AppearanceContext = createContext(null);

function getStoredAppearance() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return APPEARANCE_OPTIONS.some((option) => option.value === stored) ? stored : 'default';
}

function applyAppearance(value) {
  document.documentElement.dataset.theme = value;
  document.documentElement.style.colorScheme = value === 'white' ? 'light' : 'dark';
}

export function AppearanceProvider({ children }) {
  const [appearance, setAppearance] = useState(getStoredAppearance);

  useEffect(() => {
    applyAppearance(appearance);
    localStorage.setItem(STORAGE_KEY, appearance);
  }, [appearance]);

  function changeAppearance(value) {
    if (!APPEARANCE_OPTIONS.some((option) => option.value === value)) return;
    setAppearance(value);
  }

  return (
    <AppearanceContext.Provider value={{ appearance, changeAppearance, options: APPEARANCE_OPTIONS }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  return useContext(AppearanceContext);
}