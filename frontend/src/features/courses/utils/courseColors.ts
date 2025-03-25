// Color palettes used consistently across the application
export const COLOR_PALETTES = [
  {
    id: 0,
    name: 'blue',
    // Standard classes (border, text, etc)
    border: 'border-blue-900/50 hover:border-blue-800/70',
    text: 'text-blue-400',
    bg: 'bg-blue-900/10',
    // Gradient classes
    gradient: 'from-blue-900/40 to-blue-900/20',
    gradientBorder: 'border-blue-900/50',
    gradientHover: 'hover:border-blue-700 hover:from-blue-900/20',
    // Card specific
    cardBg: 'bg-gradient-to-r from-blue-900/30 to-blue-800/5 border-blue-900/50 hover:border-blue-700',
  },
  {
    id: 1,
    name: 'purple',
    border: 'border-purple-900/50 hover:border-purple-800/70',
    text: 'text-purple-400',
    bg: 'bg-purple-900/10',
    gradient: 'from-purple-900/40 to-purple-900/20',
    gradientBorder: 'border-purple-900/50',
    gradientHover: 'hover:border-purple-700 hover:from-purple-900/20',
    cardBg: 'bg-gradient-to-r from-purple-900/30 to-purple-800/5 border-purple-900/50 hover:border-purple-700',
  },
  {
    id: 2,
    name: 'green',
    border: 'border-green-900/50 hover:border-green-800/70',
    text: 'text-green-400',
    bg: 'bg-green-900/10',
    gradient: 'from-green-900/40 to-green-900/20',
    gradientBorder: 'border-green-900/50',
    gradientHover: 'hover:border-green-700 hover:from-green-900/20',
    cardBg: 'bg-gradient-to-r from-green-900/30 to-green-800/5 border-green-900/50 hover:border-green-700',
  },
  {
    id: 3,
    name: 'yellow',
    border: 'border-yellow-900/50 hover:border-yellow-800/70',
    text: 'text-yellow-400',
    bg: 'bg-yellow-900/10',
    gradient: 'from-yellow-900/40 to-yellow-900/20',
    gradientBorder: 'border-yellow-900/50',
    gradientHover: 'hover:border-yellow-700 hover:from-yellow-900/20',
    cardBg: 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/5 border-yellow-900/50 hover:border-yellow-700',
  },
  {
    id: 4,
    name: 'red',
    border: 'border-red-900/50 hover:border-red-800/70',
    text: 'text-red-400',
    bg: 'bg-red-900/10',
    gradient: 'from-red-900/40 to-red-900/20',
    gradientBorder: 'border-red-900/50',
    gradientHover: 'hover:border-red-700 hover:from-red-900/20',
    cardBg: 'bg-gradient-to-r from-red-900/30 to-red-800/5 border-red-900/50 hover:border-red-700',
  },
  {
    id: 5,
    name: 'indigo',
    border: 'border-indigo-900/50 hover:border-indigo-800/70',
    text: 'text-indigo-400',
    bg: 'bg-indigo-900/10',
    gradient: 'from-indigo-900/40 to-indigo-900/20',
    gradientBorder: 'border-indigo-900/50',
    gradientHover: 'hover:border-indigo-700 hover:from-indigo-900/20',
    cardBg: 'bg-gradient-to-r from-indigo-900/30 to-indigo-800/5 border-indigo-900/50 hover:border-indigo-700',
  }
];

/**
 * Gets the color palette for a course based on its colorId
 * @param course The course object or a colorId number
 * @returns The color palette object with various CSS classes
 */
export const getCourseColorPalette = (courseOrColorId: { colorId: number } | number) => {
  const colorId = typeof courseOrColorId === 'number' 
    ? courseOrColorId 
    : courseOrColorId.colorId;
  
  // Ensure we have a valid index, even if somehow invalid data comes in
  const safeColorId = Number.isInteger(colorId) && colorId >= 0 && colorId < COLOR_PALETTES.length
    ? colorId
    : 0;
    
  return COLOR_PALETTES[safeColorId];
};

/**
 * Gets specific CSS class for a course based on its colorId
 * @param course The course object or a colorId number
 * @param type The type of class to get (border, text, bg, etc)
 * @returns The CSS class string
 */
export const getCourseColorClass = (
  courseOrColorId: { colorId: number } | number,
  type: 'border' | 'text' | 'bg' | 'gradient' | 'gradientBorder' | 'gradientHover' | 'cardBg'
) => {
  const palette = getCourseColorPalette(courseOrColorId);
  return palette[type];
};

/**
 * Fallback method to get a deterministic color class when we don't have colorId
 * This is for backwards compatibility until all data includes colorId
 * @param identifier A unique identifier (like course name or ID)
 * @param type The type of class to get
 * @returns The CSS class string
 */
export const getLegacyCourseColorClass = (
  identifier: string | number,
  type: 'border' | 'text' | 'bg' | 'gradient' | 'gradientBorder' | 'gradientHover' | 'cardBg'
) => {
  // Convert identifier to string if it's a number
  const stringId = String(identifier);
  
  // Sum the character codes as a simple hash function
  const sum = stringId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Modulo to get an index within our color palette range
  const colorId = sum % COLOR_PALETTES.length;
  
  return getCourseColorClass(colorId, type);
}; 