import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  // Auto-play effect
  useEffect(() => {
    if (!autoPlay || images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, images.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (images.length === 0) {
    return <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">Sem imagens</div>;
  }

  const currentImage = images[currentIndex];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg group">
      {/* Main Image */}
      <div className="relative w-full h-full">
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className="w-full h-full object-cover object-center transition-opacity duration-500"
          fetchPriority="high"
          loading="eager"
        />

        {/* Overlay com informações */}
        {(currentImage.title || currentImage.subtitle) && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
            {currentImage.title && (
              <h3 className="text-white text-xl font-bold">{currentImage.title}</h3>
            )}
            {currentImage.subtitle && (
              <p className="text-cyan-300 text-sm">{currentImage.subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Left Arrow */}
      {showArrows && (
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-cyan-500/80 hover:bg-cyan-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Right Arrow */}
      {showArrows && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-cyan-500/80 hover:bg-cyan-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Indicators (Dots) */}
      {showIndicators && images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-cyan-400 w-6'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
