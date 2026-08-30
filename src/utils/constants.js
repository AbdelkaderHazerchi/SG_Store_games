export const APP_NAME = 'SG Store';

export const ROUTES = {
  HOME: '/',
  GAME_DETAILS: '/game/:id',
  GAME_EDIT: '/game/:id/edit',
  PUBLISH: '/publish',
  PROFILE: '/profile',
  NOTIFICATIONS: '/notifications',
  LOGIN: '/login',
  REGISTER: '/register',
};

export const COLLECTIONS = {
  GAMES: 'games',
  USERS: 'users',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
};

// Constraints (enforced in UI, Firestore rules, and Cloudinary preset)
export const LIMITS = {
  MAX_GAMES_PER_USER: 25,
  MAX_SCREENSHOTS: 5,
  MAX_BIO_LENGTH: 250,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_DEV_NOTE_LENGTH: 500,
  AVATAR_SIZE: 512,
  MIN_RATING: 1,
  MAX_RATING: 5,
};

export const GENRES = [
  'Action',
  'Adventure',
  'Arcade',
  'Puzzle',
  'Racing',
  'RPG',
  'Shooter',
  'Simulation',
  'Sports',
  'Strategy',
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'views', label: 'Most Played' },
];

export const REPORT_REASONS = [
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'fake_ai_claim', label: 'False AI claim' },
  { value: 'broken_link', label: 'Broken / unsafe link' },
];
