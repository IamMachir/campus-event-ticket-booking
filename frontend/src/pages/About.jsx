import { GraduationCap, Users } from 'lucide-react';

const members = [
  { id: 'UGE/27816/14', name: 'Abenezer Tewodros' },
  { id: 'UGE/27834/14', name: 'Efa Mirkana Abdisa' },
  { id: 'UGE/27638/14', name: 'Machir Tadesse Woldemariam' },
  { id: 'UGE/27831/14', name: 'Musbha Rida' },
  { id: 'UGE/27830/14', name: 'Samii Girmaa' },
  { id: 'UGE/27827/14', name: 'Seid Jemal' },
];

export default function About() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pt-24">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-astu-500 to-astuGreen-500 mb-4 animate-glow-pulse">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl text-slate-100">About This Project</h1>
        <p className="text-slate-400 text-sm mt-2">Campus Event Discovery & Ticket Booking Web App</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <p className="text-slate-300 leading-relaxed">
          This web application helps university students discover campus events and book tickets online.
          Organizers create and manage events; students browse, book seats, and receive digital tickets
          with QR codes for check-in at the venue. It replaces manual, paper-based event announcements
          and ticketing with a centralized, easy-to-use platform.
        </p>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-display font-semibold text-xl text-slate-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-astu-400" /> Group Members
        </h2>
        <p className="text-slate-400 text-sm mb-4">Computer Science and Engineering (CSE), 5th Year, Section 1</p>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/5">
              <span className="font-mono text-sm text-astu-400">{m.id}</span>
              <span className="text-slate-200 font-medium">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
