'use client';
import { Check, Star, Heart, User, Briefcase, FileText, Coffee, Bookmark, Square, CheckSquare, Edit3, Image as ImageIcon, Clock } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { triggerHaptic } from '../lib/haptics';

const ICONS_MAP: any = { 
  Saúde: Heart, 
  Pessoal: User, 
  Trabalho: Briefcase, 
  Documentos: FileText, 
  Alimentação: Coffee, 
  Geral: Bookmark 
};

export default function TaskCard({ task, sectionType, onComplete, onEdit, onToggleCheck, onSnooze }: any) {
  const Icon = ICONS_MAP[task.category] || Bookmark;
  
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-100, 0, 100],
    ['rgba(239, 68, 68, 0.2)', 'rgba(24, 24, 27, 0.4)', 'rgba(34, 197, 94, 0.2)']
  );

  // Define a borda lateral baseada no status/prazo (Atrasado = Vermelho, Hoje = Mostarda, Normal = Cinza)
  const borderStyle = 
    sectionType === 'past' ? 'border-red-500/40 bg-red-950/10' :
    sectionType === 'today' ? 'border-amber-500/40 bg-amber-950/10' :
    'border-zinc-800 bg-zinc-900/90';

  // Identifica se é item de saúde/remédio para destaque visual extra
  const isMedication = task.category === 'Saúde' || /metadona|escitalopram|mg|cps|remédio/i.test(task.title);

  function handleDragEnd(event: any, info: any) {
    if (info.offset.x > 100 || info.offset.x < -100) {
      triggerHaptic('success');
      onComplete(task.id);
    }
  }

  return (
    <motion.div 
      style={{ background }}
      className={`rounded-3xl overflow-hidden border shadow-sm transition-all ${borderStyle}`}
    >
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        style={{ x }}
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="p-4 backdrop-blur-md flex flex-col gap-3 select-none"
      >
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center">
            <div className={`p-2.5 rounded-2xl ${isMedication ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-indigo-500/10 text-indigo-400'}`}>
              <Icon size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-zinc-100">{task.title}</h3>
                {task.is_important && <Star size={14} className="text-amber-400 fill-amber-400" />}
                {isMedication && (
                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-md text-[9px] font-bold tracking-wider uppercase">
                    Medicação
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{task.category}</span>
                {task.reminder_time && (
                  <span className="text-[10px] text-zinc-400">
                    • {new Date(task.reminder_time).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {new Date(task.reminder_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Botão de Adiar Rápido (+30 min) se houver horário */}
            {task.reminder_time && onSnooze && (
              <button 
                onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); onSnooze(task.id); }} 
                className="p-2.5 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-amber-400 hover:bg-zinc-700 transition-all"
                title="Adiar por 30 minutos"
              >
                <Clock size={15} />
              </button>
            )}

            {/* Botão de Edição Dedicado no Card */}
            <button 
              onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); onEdit(task); }} 
              className="p-2.5 rounded-xl bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
              title="Editar Lembrete"
            >
              <Edit3 size={15} />
            </button>

            {/* Botão de Concluir */}
            <button 
              onClick={(e) => { e.stopPropagation(); triggerHaptic('success'); onComplete(task.id); }} 
              className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
              title="Concluir"
            >
              <Check size={16} />
            </button>
          </div>
        </div>

        {/* Checklist Integrado no Card */}
        {task.checklist && task.checklist.length > 0 && (
          <div className="space-y-1.5 pl-2 border-l border-zinc-800 ml-1 pt-1">
            {task.checklist.map((item: any) => (
              <div 
                key={item.id} 
                onClick={(e) => { e.stopPropagation(); triggerHaptic('light'); onToggleCheck(task.id, item.id); }} 
                className="flex items-center gap-2 py-1 px-2 rounded-xl text-xs text-zinc-400 hover:bg-zinc-800/60 transition-all cursor-pointer"
              >
                {item.completed ? <CheckSquare size={14} className="text-indigo-400 shrink-0" /> : <Square size={14} className="text-zinc-600 shrink-0" />}
                <span className={item.completed ? 'line-through text-zinc-600' : 'text-zinc-300'}>{item.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Preview de Anexos Direto no Card */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80 mt-1">
            {task.attachments.map((file: any, idx: number) => (
              <a 
                key={idx}
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800/80 hover:bg-zinc-700 rounded-xl text-[10px] text-indigo-300 font-medium transition-all border border-zinc-700/50"
              >
                <ImageIcon size={12} className="text-indigo-400" />
                <span className="truncate max-w-[120px]">{file.name}</span>
              </a>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
