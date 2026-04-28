import Link from 'next/link';

const items = [
  ['Chats', '/dashboard/chats'],
  ['Contacts', '/dashboard/contacts'],
  ['Tickets', '/dashboard/tickets'],
  ['Campaign', '/dashboard/campaigns'],
  ['AI Training', '/dashboard/training'],
  ['Workflows', '/dashboard/workflows'],
  ['Payments', '/dashboard/payments'],
  ['Analytics', '/dashboard/analytics'],
  ['Settings', '/dashboard/settings']
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4">
      <h1 className="text-xl font-semibold mb-6">JoyzAI Clone</h1>
      <nav className="space-y-2">
        {items.map(([label, href]) => (
          <Link key={href} href={href} className="block rounded-lg px-3 py-2 hover:bg-slate-100">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
