export function Navbar() {
  return (
    <header className="hidden lg:flex justify-between items-center bg-green-700 text-white p-4">
      <h1 className="text-lg font-semibold">
        Smart Production & Management System
      </h1>
      <div>
        <span className="font-semibold">Admin User</span>
        <p className="text-sm">System Administrator</p>
      </div>
    </header>
  );
}
