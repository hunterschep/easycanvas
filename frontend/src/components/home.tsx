import Account from './Account';

const Home = () => {
  // Placeholder data (replace with actual data from Canvas API)
  const assignments = [
    { id: 1, title: 'Final Project', course: 'Web Development', dueDate: '2024-03-20' },
    { id: 2, title: 'Midterm Essay', course: 'English Literature', dueDate: '2024-03-15' },
    { id: 3, title: 'Problem Set 3', course: 'Mathematics', dueDate: '2024-03-18' },
  ];

  const courses = [
    { id: 1, name: 'Web Development', code: 'CS 401' },
    { id: 2, name: 'English Literature', code: 'ENG 201' },
    { id: 3, name: 'Mathematics', code: 'MATH 301' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tighter">
              easy<span className="text-gray-500">canvas</span>
            </h1>
            <Account />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Assignments Section */}
          <div className="lg:col-span-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Upcoming Assignments</h2>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{assignment.title}</h3>
                          <p className="text-sm text-gray-400">{assignment.course}</p>
                        </div>
                        <span className="text-sm text-gray-400">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div className="lg:col-span-1">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white via-gray-500 to-black rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-black border border-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Your Courses</h2>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 border border-gray-800 rounded-lg hover:border-gray-600 transition-all duration-200 cursor-pointer"
                    >
                      <h3 className="font-medium">{course.name}</h3>
                      <p className="text-sm text-gray-400">{course.code}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;