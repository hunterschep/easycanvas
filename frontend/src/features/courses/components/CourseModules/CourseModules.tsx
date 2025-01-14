import { useNavigate } from 'react-router-dom';
import type { CanvasModule } from '@/types/canvas.types';
import { useModuleItems } from '../../hooks/useModuleItems';

interface CourseModulesProps {
  modules: CanvasModule[];
  courseId: number;
}

export const CourseModules = ({ modules, courseId }: CourseModulesProps) => {
  const navigate = useNavigate();
  const { getModuleItems } = useModuleItems();

  return (
    <div className="space-y-4">
      {modules.map((module) => (
        <details key={module.id} className="group bg-gray-900 rounded-lg">
          <summary className="flex justify-between items-center cursor-pointer list-none p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200">
            <div className="flex items-center gap-2">
              <svg 
                className="w-4 h-4 transition-transform duration-200 group-open:rotate-90" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
              </svg>
              <h3 className="font-medium">{module.name}</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {module.items_count} items
              </span>
              {module.state === 'completed' && (
                <span className="text-green-400">✓</span>
              )}
            </div>
          </summary>
          
          <ModuleItems moduleId={module.id} courseId={courseId} />
          
        </details>
      ))}
    </div>
  );
};

const ModuleItems = ({ moduleId, courseId }) => {
  const { items, loading } = useModuleItems(courseId, moduleId);
  
  if (loading) {
    return <div className="p-4 text-gray-400">Loading items...</div>;
  }
  
  return (
    <div className="p-4 space-y-2">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 border border-gray-800 rounded hover:border-gray-600 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{item.title}</span>
              <span className="text-xs text-gray-400">({item.type})</span>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </a>
      ))}
    </div>
  );
};

