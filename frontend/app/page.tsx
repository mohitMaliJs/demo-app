export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">Employee Management System</h1>
      <p className="text-xl mb-8">Welcome to the Employee Management System</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <a href="/login" className="p-6 bg-blue-100 rounded-lg shadow-md hover:shadow-lg transition-all">
          <h2 className="text-2xl font-semibold mb-2">Login</h2>
          <p>Access your organization's dashboard</p>
        </a>
        <a href="/register" className="p-6 bg-green-100 rounded-lg shadow-md hover:shadow-lg transition-all">
          <h2 className="text-2xl font-semibold mb-2">Register</h2>
          <p>Create a new organization account</p>
        </a>
      </div>
    </main>
  );
}