'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { db, Task } from '../../lib/db';
import Header from '../../components/Header';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { triggerHaptic } from '../../lib/haptics';

export default function CalendarPage() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Data atual selecionada no calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login');
      } else {
        setUser(data.user);
        loadTasks();
      }
      setLoadingAuth(false);
    });
  }, [router]);

  async function loadTasks() {
    const allTasks = await db.tasks.toArray();
    setTasks(allTasks);
  }

  if (loadingAuth) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest">
        Carregando...
      </main>
    );
  }

  // Lógica do Calendário Mensal
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  function handlePrevMonth() {
    triggerHaptic('light');
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    triggerHaptic('light');
    setCurrentDate(new Date(year, month + 1, 1));
  }

  // Filtra tarefas do dia selecionado
  const selectedDateTasks = tasks.filter(task => {
    if (!task.reminder_time) return false;
    const taskDateStr = new Date(task.reminder_time).toISOString().split('T')[0];
    return taskDateStr === selectedDate;
  });

  return (
    <main className="min-h-screen bg-zinc-950 pb-24 text-zinc-100 font-sans">
      <Header />
      
      {/* Navegação e Voltar */}
      <div className="px-6 mt-6 mb-6 flex items-center gap-3">
        <button 
          onClick={() => { triggerHaptic('light'); router.push('/'); }}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-indigo-400 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-300">
          Calendário Mensal
        </h2>
      </div>

      <div className="px-6 space-y-6 max-w-md mx-auto">
        
        {/* Bloco Principal do Calendário */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-5 shadow-xl">
          
          {/* Cabeçalho do Mês */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <span key={d} className="text-[10px] font-bold text-zinc-500 uppercase">
                {d}
              </span>
            ))}
          </div>

          {/* Grade de Dias */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Espaços vazios antes do primeiro dia do mês */}
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10" />
            ))}

            {/* Dias do Mês */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const dayNum = index + 1;
              const formattedDay = String(dayNum).padStart(2, '0');
              const formattedMonth = String(month + 1).padStart(2, '0');
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              // Verifica se há tarefas neste dia
              const hasTasks = tasks.some(t => {
                if (!t.reminder_time) return false;
                return new Date(t.reminder_time).toISOString().split('T')[0] === dateStr;
              });

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedDate(dateStr);
                  }}
                  className={`relative h-10 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : isToday 
                      ? 'border border-indigo-500/50 bg-indigo-500/10 text-indigo-300' 
                      : 'bg-zinc-950/50 border border-zinc-800/60 text-zinc-300 hover:bg-zinc-800/50'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasTasks && !isSelected && (
                    <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-indigo-400" />
                  )}
                  {hasTasks && isSelected && (
                    <span className="absolute bottom-1.5 w-1 h-1 rounded-full bg-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tarefas do Dia Selecionado */}
        <div className="space-y-3">
          <div className="flex items-center justify-between ml-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Tarefas para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
            <span className="text-[10px] text-indigo-400 font-bold">{selectedDateTasks.length} encontrada(s)</span>
          </div>

          <div className="space-y-2">
            {selectedDateTasks.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                <CalendarIcon size={24} className="mx-auto text-zinc-700 mb-2" />
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Nenhum compromisso neste dia</p>
              </div>
            ) : (
              selectedDateTasks.map(task => (
                <div 
                  key={task.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-zinc-200">{task.title}</h4>
                        {task.is_important && <Star size={12} className="text-amber-400 fill-amber-400" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-0.5 uppercase font-medium">
                        {task.category} • {new Date(task.reminder_time!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-lg ${task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {task.status === 'completed' ? 'Concluída' : 'Pendente'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
