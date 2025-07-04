import { Cloud, BarChart3, Code, Plug, Database, FileText, Shield } from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "functions", label: "Cloud Functions", icon: Code },
  { id: "endpoints", label: "Cloud Endpoints", icon: Plug },
  { id: "firestore", label: "Firestore", icon: Database },
  { id: "logging", label: "Logging", icon: FileText },
  { id: "iam", label: "IAM & Admin", icon: Shield },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="gcp-sidebar">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-blue-600 flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Cloud Console
        </h1>
      </div>
      
      <nav className="py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`gcp-nav-link w-full text-left ${
                activeSection === item.id ? "active" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
