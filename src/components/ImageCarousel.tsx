"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselImage {
  url: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
}

export default function ImageCarousel({
  images,
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
  showArrows = true,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);

  const goToPrevious = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];
  const isApiImage = currentImage.url.startsWith("/api/");

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-[24px]">
      <Image
        key={currentImage.url}
        src={currentImage.url}
        alt={currentImage.alt}
        fill
        priority={currentIndex === 0}
        quality={74}
        sizes="(min-width: 1280px) 560px, (min-width: 1024px) 46vw, 100vw"
        unoptimized={isApiImage}
        className="object-cover object-center transition-transform duration-500"
      />

      {(currentImage.title || currentImage.subtitle) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
          {currentImage.title && (
            <h3 className="text-xl font-bold text-white">{currentImage.title}</h3>
          )}
          {currentImage.subtitle && (
            <p className="text-sm text-cyan-300">{currentImage.subtitle}</p>
          )}
        </div>
      )}

      {showArrows && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-cyan-500/80 p-2 text-white opacity-0 transition-opacity hover:bg-cyan-600 group-hover:opacity-100"
            aria-label="Imagem anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-cyan-500/80 p-2 text-white opacity-0 transition-opacity hover:bg-cyan-600 group-hover:opacity-100"
            aria-label="Próxima imagem"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-cyan-400"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
