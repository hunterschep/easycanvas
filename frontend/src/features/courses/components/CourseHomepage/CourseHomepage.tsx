import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface CourseHomepageProps {
  html: string;
}

export const CourseHomepage = ({ html }: CourseHomepageProps) => {
  const sanitizedHtml = useMemo(() => {
    const clean = DOMPurify.sanitize(html, {
      FORBID_TAGS: ['img', 'iframe', 'video', 'audio'],
      FORBID_ATTR: ['src', 'srcset']
    });
    return clean;
  }, [html]);

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-black border border-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Course Information</h2>
        <div 
          className="prose prose-invert max-w-none text-gray-400"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    </div>
  );
}; 