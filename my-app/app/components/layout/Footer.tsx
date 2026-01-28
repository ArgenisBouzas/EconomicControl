export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 px-4 border-t border-gray-700">
      <div className="container mx-auto">
        {/* Información principal */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          {/* Derechos reservados */}
          <div className="text-center md:text-left">
            <p className="text-xl font-bold mb-2">Argenis Bouzas</p>
            <p className="text-gray-300">
              © {currentYear} Todos los derechos reservados
            </p>
          </div>
          
          {/* Información de contacto */}
          <div className="text-center md:text-right">
            <p className="mb-2">
              <span className="text-gray-400">Email: </span>
              <a 
                href="mailto:argenisjb@gmail.com" 
                className="text-blue-300 hover:text-blue-400 transition-colors"
              >
                argenisjb@gmail.com
              </a>
            </p>
            <p className="mb-2">
              <span className="text-gray-400">WhatsApp: </span>
              <a 
                href="https://wa.me/580426993341" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-300 hover:text-green-400 transition-colors"
              >
                +58 0426 993341
              </a>
            </p>
            <p>
              <span className="text-gray-400">Discord: </span>
              <span className="text-purple-300 font-mono">
                ArgenisBouzas#3208
              </span>
            </p>
          </div>
        </div>
        
        {/* Separador */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p className="mb-2 md:mb-0">
              Desarrollado con ❤️ usando Next.js 14
            </p>
            <p>
              Última actualización: {currentYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}