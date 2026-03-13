import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackButton() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <Button
      onClick={handleBack}
      className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center gap-2"
    >
      <ChevronLeft className="w-5 h-5" />
      Voltar
    </Button>
  );
}
