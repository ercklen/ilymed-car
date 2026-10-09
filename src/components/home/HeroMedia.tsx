interface HeroMediaProps {
  isAr: boolean;
  locale: string;
}

export default function HeroMedia({ isAr, locale }: HeroMediaProps) {
  // Ultra High-Resolution luxury automotive photography (3200px wide, high quality)
  const highQualityPhotoUrl =
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=90&w=3200&auto=format&fit=crop';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* High-Resolution Background Image */}
      <img
        src={highQualityPhotoUrl}
        alt="ILYMED CAR Luxury Fleet Morocco"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000"
      />

      {/* Luxury Vignette & Radial Gradients (Preserves high readability & elegant contrast) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-[#0B1120]/60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
    </div>
  );
}
