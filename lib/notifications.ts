import { db } from './db';

// Solicitar permissão de notificação no navegador/celular
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Disparar notificação nativa
export function triggerLocalNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
    });
  }
}

// Cálculo de distância via Fórmula de Haversine (em Metros)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Raio da Terra em metros
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distância exata em metros
}

// Monitor de localização em segundo plano com Otimização de Carga
export function startGeofenceWatcher() {
  if (!navigator.geolocation) return;

  navigator.geolocation.watchPosition(
    async (pos) => {
      const userLat = pos.coords.latitude;
      const userLng = pos.coords.longitude;

      // Otimização: Busca apenas tarefas pendentes que possuem gatilho de local
      const locationTasks = await db.tasks
        .where('reminder_type')
        .equals('location')
        .and(t => t.status === 'pending')
        .toArray();

      if (locationTasks.length === 0) return; // Evita processamento desnecessário se não houver metas de local

      for (const task of locationTasks) {
        if (!task.lat || !task.lng) continue;
        
        const distance = calculateHaversineDistance(userLat, userLng, task.lat, task.lng);
        const maxRadius = task.radius_meters || 100;

        if (distance <= maxRadius && !task.notified) {
          triggerLocalNotification(
            `Lembrete de Local: ${task.title}`,
            `Você está a ${Math.round(distance)}m de ${task.location_name || 'um local cadastrado'}.`
          );

          // Marca como notificado para evitar disparos repetidos
          if (task.id) {
            await db.tasks.update(task.id, { notified: true });
          }
        }
      }
    },
    (err) => console.error('Erro no rastreamento de GPS:', err),
    { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
  );
}
