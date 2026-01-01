import { useState } from "react";
import { Menu } from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`${
          open ? "w-64" : "w-16"
        } transition-all duration-300 bg-slate-900 text-white flex flex-col`}
      >
        <button
          onClick={() => setOpen(!open)}
          className="p-4 hover:bg-slate-800"
        >
          <Menu />
        </button>

        <nav className="flex flex-col gap-2 p-2">
          <a className="p-2 rounded hover:bg-slate-800">Dashboard</a>
          <a className="p-2 rounded hover:bg-slate-800">Chat Tutor</a>
          <a className="p-2 rounded hover:bg-slate-800">Quiz</a>
          <a className="p-2 rounded hover:bg-slate-800">Learning Path</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-2xl font-bold">EduPath AI</h1>
      </div>
    </div>
  );
}
