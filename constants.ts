import { ColorId, TeamColor } from './types';

// === CONFIGURATION ===

// URL of your local Node.js server
// Using 127.0.0.1 is often more reliable than localhost in some Node environments
export const API_BASE_URL = 'http://127.0.0.1:3001';

export const USE_SIMULATION_MODE = false;

// === TEAM COLORS ===

export const TEAM_COLORS: Record<ColorId, TeamColor> = {
  [ColorId.RED]: {
    id: ColorId.RED,
    name: 'Phoenix Red',
    hex: '#EF4444', // Tailwind red-500
    textColor: '#FFFFFF'
  },
  [ColorId.BLUE]: {
    id: ColorId.BLUE,
    name: 'Ocean Blue',
    hex: '#3B82F6', // Tailwind blue-500
    textColor: '#FFFFFF'
  },
  [ColorId.GREEN]: {
    id: ColorId.GREEN,
    name: 'Forest Green',
    hex: '#10B981', // Tailwind emerald-500
    textColor: '#FFFFFF'
  },
  [ColorId.YELLOW]: {
    id: ColorId.YELLOW,
    name: 'Thunder Yellow',
    hex: '#F59E0B', // Tailwind amber-500
    textColor: '#FFFFFF'
  },
  [ColorId.PURPLE]: {
    id: ColorId.PURPLE,
    name: 'Mystery Purple',
    hex: '#8B5CF6', // Tailwind violet-500
    textColor: '#FFFFFF'
  },
  [ColorId.ORANGE]: {
    id: ColorId.ORANGE,
    name: 'Tiger Orange',
    hex: '#F97316', // Tailwind orange-500
    textColor: '#FFFFFF'
  }
};

export const COLORS_LIST = Object.values(TEAM_COLORS);

export const LOCAL_STORAGE_KEY = 'rubnong_user_state_v1';
export const OFFLINE_STORAGE_KEY = 'rubnong_offline_counts_v1';