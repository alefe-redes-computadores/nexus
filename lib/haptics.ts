export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const patterns = {
      light: 5,
      medium: 15,
      heavy: 30,
      success: [10, 50, 20]
    };
    navigator.vibrate(patterns[type]);
  }
};
