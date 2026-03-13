import BackButton from "@/components/BackButton";
import { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function PageWrapper({ children, className = "min-h-screen bg-white" }: PageWrapperProps) {
  return (
    <div className={className}>
      {/* Back Button */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            <BackButton />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
