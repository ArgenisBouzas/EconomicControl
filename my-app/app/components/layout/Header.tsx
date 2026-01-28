import Navbar from "./Navbar";

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-800 to-blue-600 w-full p-4 text-white shadow-lg">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo o título principal */}
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Economic Control
            </h1>
            
          </div>
          
          {/* Navegación */}
          
        </div>
        
      
      </div>
    </header>
  );
}