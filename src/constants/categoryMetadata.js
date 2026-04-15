/**
 * Hardcoded metadata for item categories.
 * Move UI-specific assets like icons and emojis here to keep the database lean.
 */
export const CATEGORY_METADATA = {
  // Existing & New Mappings (Aligned with DB IDs)
  'cellphone': {
    icon: 'fa-solid fa-mobile-screen-button',
    emoji: '📱'
  },
  'laptop': {
    icon: 'fa-solid fa-laptop',
    emoji: '💻'
  },
  'tablet': {
    icon: 'fa-solid fa-tablet-screen-button',
    emoji: '📟'
  },
  'id card': {
    icon: 'fa-solid fa-id-card',
    emoji: '🪪'
  },
  'wallet': {
    icon: 'fa-solid fa-wallet',
    emoji: '👛'
  },
  'bag / backpack': {
    icon: 'fa-solid fa-bag-shopping',
    emoji: '🎒'
  },
  'keys': {
    icon: 'fa-solid fa-key',
    emoji: '🔑'
  },
  'headphones / earbuds': {
    icon: 'fa-solid fa-headphones',
    emoji: '🎧'
  },
  'watch / wearable': {
    icon: 'fa-solid fa-stopwatch',
    emoji: '⌚'
  },
  'water bottle': {
    icon: 'fa-solid fa-bottle-water',
    emoji: '🍼'
  },
  'eyewear': {
    icon: 'fa-solid fa-glasses',
    emoji: '👓'
  },
  'book': {
    icon: 'fa-solid fa-book',
    emoji: '📖'
  },
  'notebook': {
    icon: 'fa-solid fa-book-open',
    emoji: '📒'
  },
  'stationery': {
    icon: 'fa-solid fa-pen-nib',
    emoji: '✏️'
  },
  'clothing': {
    icon: 'fa-solid fa-shirt',
    emoji: '👕'
  },
  'accessories': {
    icon: 'fa-solid fa-gem',
    emoji: '💍'
  },
  'electronics-accessories': {
    icon: 'fa-solid fa-plug',
    emoji: '🔌'
  },
  'computer-peripheral': {
    icon: 'fa-solid fa-mouse',
    emoji: '🖱️'
  },
  'electronics': {
    icon: 'fa-solid fa-bolt',
    emoji: '⚡'
  },
  'documents': {
    icon: 'fa-solid fa-file-invoice',
    emoji: '📄'
  },
  'wallets': {
    icon: 'fa-solid fa-wallet', // Changed from bags-shopping (Pro) to wallet (Free)
    emoji: '💼'
  },
  'umbrella': {
    icon: 'fa-solid fa-umbrella',
    emoji: '☂️'
  },
  'other': {
    icon: 'fa-solid fa-box-open',
    emoji: '📦'
  },

  // Aliases for retro-compatibility (hyphenated versions)
  'id-card': { icon: 'fa-solid fa-id-card', emoji: '🪪' },
  'bag-backpack': { icon: 'fa-solid fa-bag-shopping', emoji: '🎒' },
  'watch': { icon: 'fa-solid fa-stopwatch', emoji: '⌚' },
  'headphones': { icon: 'fa-solid fa-headphones', emoji: '🎧' },
  'water-bottle': { icon: 'fa-solid fa-bottle-water', emoji: '🍼' }
};

export const DEFAULT_CATEGORY_META = {
  icon: 'fa-solid fa-box',
  emoji: '📦'
};
