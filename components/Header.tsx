'use client';
export default function Header({ user }: { user: any }) {
  return (
    <header className="flex items-center justify-between px-6 pt-8 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Álefe'}</h1>
        <p className="text-sm text-zinc-500">Gestão Inteligente</p>
      </div>
      {user?.user_metadata?.avatar_url && (
        <img src={user.user_metadata.avatar_url} className="h-10 w-10 rounded-full border border-zinc-700" alt="Perfil" />
      )}
    </header>
  );
}
