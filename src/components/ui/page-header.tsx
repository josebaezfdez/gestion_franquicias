import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ icon: Icon, title, description, actions }: PageHeaderProps) {
  return (
    <div className="bg-white dark:bg-[#1e2836] border-l-4 border-l-red-600 px-4 sm:px-8 py-6 flex items-start gap-3 sm:gap-4">
      <div className="bg-red-100 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {description && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap gap-2 w-full sm:w-auto">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
