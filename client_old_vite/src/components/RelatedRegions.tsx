import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { regions } from "@shared/regions";

interface RelatedRegionsProps {
  currentRegion: string;
  maxItems?: number;
}

export default function RelatedRegions({ currentRegion, maxItems = 4 }: RelatedRegionsProps) {
  // Get related regions (same area or nearby)
  const relatedRegions = regions
    .filter(r => r.name !== currentRegion)
    .slice(0, maxItems);

  if (relatedRegions.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="flex justify-center px-4">
        <div className="w-full max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Serviços em Regiões Próximas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedRegions.map((region) => (
              <Link key={region.id} href={`/recolha-moveis-${region.slug}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {region.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Recolha de móveis, entulho e monos em {region.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="text-cyan-600 hover:text-cyan-700 p-0 h-auto justify-start"
                  >
                    Ver serviços
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
