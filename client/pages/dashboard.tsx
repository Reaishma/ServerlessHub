import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Overview from "@/components/sections/overview";
import CloudFunctions from "@/components/sections/cloud-functions";
import CloudEndpoints from "@/components/sections/cloud-endpoints";
import Firestore from "@/components/sections/firestore";
import Logging from "@/components/sections/logging";
import IAM from "@/components/sections/iam";

const sections = {
  overview: Overview,
  functions: CloudFunctions,
  endpoints: CloudEndpoints,
  firestore: Firestore,
  logging: Logging,
  iam: IAM,
};

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<keyof typeof sections>("overview");

  const ActiveComponent = sections[activeSection];

  return (
    <div className="gcp-dashboard">
      <div className="grid grid-cols-[240px_1fr] grid-rows-[64px_1fr] min-h-screen">
        {/* Header */}
        <header className="gcp-header col-span-2 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Serverless Platform Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Reaishma N</span>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              R
            </div>
          </div>
        </header>

        {/* Sidebar */}
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Main Content */}
        <main className="p-6 overflow-y-auto">
          <ActiveComponent />
          
          {/* Footer */}
          <div className="gcp-footer">
            <p>
              <strong>Developer:</strong> Reaishma N | <strong>Email:</strong> vra.9618@gmail.com
            </p>
            <p>
              <strong>GitHub:</strong>{" "}
              <a href="https://github.com/Reaishma" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                https://github.com/Reaishma
              </a>
            </p>
            <p>
              This is a portfolio demonstration of a serverless platform interface simulating Google Cloud Platform services.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
        }
