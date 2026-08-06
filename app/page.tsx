// app/page.tsx
'use client';

import Link from 'next/link';
import { Briefcase, User, HeartPulse, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const pillars = [
    {
      title: 'Empresa',
      description: 'Tarefas corporativas, prazos e documentos.',
      href: '/empresa',
      icon: Briefcase,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    },
    {
      title: 'Pessoal',
      description: 'Rotinas diárias, compras e metas rápidas.',
      href: '/pessoal',
      icon: User,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    },
    {
      title: 'Saúde',
      description: 'Medicamentos, receitas e consultas médicas.',
      href: '/saude',
      icon: HeartPulse,
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
    },
  ];

  return (
    <div className="flex flex-col gap-8 my-auto">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Nexus Local-First Ativo</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Sua Rotina Unificada</h1>
        <p className="text-zinc-400 text-sm">Selecione um pilar para gerenciar suas tarefas e contextos.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={pillar.href}
                className={`flex flex-col gap-4 p-5 rounded-2xl border bg-gradient-to-br ${pillar.color} backdrop-blur-xl transition-all hover:scale-[1.02] active:scale-[0.98]`}
              >
                <div className="p-3 w-fit rounded-xl bg-zinc-900/60 border border-white/10">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{pillar.title}</h2>
                  <p className="text-xs text-zinc-400 mt-1">{pillar.description}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
