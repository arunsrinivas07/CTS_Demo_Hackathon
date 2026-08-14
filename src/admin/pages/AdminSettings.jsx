import React from 'react';

import {
  Settings,
  Users,
  Server,
  Cpu,
} from 'lucide-react';

export default function AdminSettings() {

  const sections = [
    {
      title: 'System Settings',
      description:
        'View administrative system configuration and platform information.',
      icon: Settings,
      status: 'View only',
    },

    {
      title: 'User Management',
      description:
        'Manage administrator and investigator access when supported by the backend.',
      icon: Users,
      status: 'Backend dependent',
    },

    {
      title: 'API Status',
      description:
        'Review the connectivity status of the application backend APIs.',
      icon: Server,
      status: 'View only',
    },

    {
      title: 'Model Configuration Status',
      description:
        'View the operational configuration status of the deployed ML components.',
      icon: Cpu,
      status: 'View only',
    },
  ];

  return (
    <div className="space-y-5">

      <div>

        <h2 className="text-lg font-extrabold text-slate-900">
          Settings
        </h2>

        <p className="text-xs text-slate-500 mt-1">
          Administrative system configuration and service status
        </p>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {sections.map((section) => {

          const Icon = section.icon;

          return (
            <div
              key={section.title}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5"
            >

              <div className="flex items-start gap-4">

                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1">

                  <div className="flex items-start justify-between gap-3">

                    <h3 className="text-sm font-bold text-slate-900">
                      {section.title}
                    </h3>

                    <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-md whitespace-nowrap">
                      {section.status}
                    </span>

                  </div>

                  <p className="text-xs text-slate-500 mt-2 leading-5">
                    {section.description}
                  </p>

                </div>

              </div>

            </div>
          );
        })}

      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">

        <h3 className="text-sm font-bold text-amber-800">
          Protected ML Configuration
        </h3>

        <p className="text-xs text-amber-700 mt-2 leading-5">
          Model training, feature-schema editing, SHAP configuration and
          ML artifact modification are not available from the Admin UI.
          These components remain controlled by the backend ML pipeline.
        </p>

      </div>

    </div>
  );
}