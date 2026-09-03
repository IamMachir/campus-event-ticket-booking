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
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-1">About This Project</h1>
      <p className="text-sm text-gray-500 mb-4">
        Campus Event Discovery & Ticket Booking Web App — Capstone Project
      </p>

      <h2 className="font-medium mb-2">Group Members</h2>
      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Name</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td className="p-2 border font-mono">{m.id}</td>
              <td className="p-2 border">{m.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
