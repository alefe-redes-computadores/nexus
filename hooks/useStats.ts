import { useState, useEffect } from 'react';
import { db } from '../lib/db';

export function useStats(userId: string | null, tasks: any[]) {
  const [completedToday, setCompletedToday] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const calculateStats = async () => {
      // Pega todas as tarefas arquivadas (concluídas)
      const archived = await db.tasks.where('status').equals('archived').toArray();

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      // Extrai apenas as datas únicas em que tarefas foram atualizadas (concluídas)
      const dates = archived
        .map(t => t.updated_at?.slice(0, 10))
        .filter(Boolean) as string[];
      
      const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));

      // Tarefas concluídas HOJE
      const todayCount = archived.filter(t => t.updated_at?.slice(0, 10) === todayStr).length;
      setCompletedToday(todayCount);

      // Cálculo da Sequência (Streak)
      let currentStreak = 0;
      let dateToCheck = new Date(now);

      // Se não tem tarefas hoje, e não teve ontem, a sequência foi quebrada (é 0)
      if (!uniqueDates.includes(todayStr) && !uniqueDates.includes(yesterdayStr)) {
        setStreak(0);
        return;
      }

      // Conta os dias consecutivos retroativamente
      while (true) {
        const checkStr = dateToCheck.toISOString().slice(0, 10);
        if (uniqueDates.includes(checkStr)) {
          currentStreak++;
          dateToCheck.setDate(dateToCheck.getDate() - 1);
        } else {
          // Se hoje estiver vazio, mas ontem tem (a sequência não quebrou, só não foi iniciada hoje ainda)
          if (checkStr === todayStr) {
            dateToCheck.setDate(dateToCheck.getDate() - 1);
          } else {
            break;
          }
        }
      }
      setStreak(currentStreak);
    };

    calculateStats();
  }, [userId, tasks]); // Recalcula sempre que as tarefas ativas mudarem

  return { completedToday, streak };
}
