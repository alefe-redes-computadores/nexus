// lib/haptics.ts

export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warning' | 'error' = 'light') {
  if (typeof window === 'undefined' || !('navigator' in window)) return;

  // Verifica se o navegador/dispositivo suporta vibração
  if (!navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(35);
        break;
      case 'success':
        navigator.vibrate([30, 50, 30]); // Padrão duplo suave para sucesso
        break;
      case 'warning':
        navigator.vibrate([50, 40, 50]);
        break;
      case 'error':
        navigator.vibrate([80, 50, 80, 50, 80]); // Padrão de alerta mais forte
        break;
      default:
        navigator.vibrate(15);
    }
  } catch (err) {
    // Silencia erros de permissão de vibração do browser
    console.debug('Haptics não suportado ou bloqueado:', err);
  }
}
