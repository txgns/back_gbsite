
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-robotics-black flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center glass-card p-8 rounded-xl animate-fade-in">
        <div className="mb-8">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-muted">
            <span className="text-4xl font-bold text-gradient">404</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-white">Página não encontrada</h1>
          <p className="text-muted-foreground mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button 
            variant="default" 
            asChild
            className="w-full sm:w-auto"
          >
            <Link to="/">
              <Home size={18} />
              <span>Voltar ao início</span>
            </Link>
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft size={18} />
            <span>Voltar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
