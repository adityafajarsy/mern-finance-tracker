import hpHeroImage from "../assets/hp_hero.webp";

export const HeroProductVisual = ({ className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      
      {/* Compact, proportional 3D iPhone Visual (Guaranteed no distortion) */}
      <div className="relative w-64 sm:w-76 md:w-88 lg:w-95 flex items-center justify-center">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-[#00A86B]/15 blur-2xl rounded-full transform scale-75 -z-10 pointer-events-none" />

        <img
          src={hpHeroImage}
          alt="SALDO Mobile App Preview"
          className="w-full h-auto max-h-125 object-contain drop-shadow-[0_20px_30px_rgba(8,36,27,0.20)] transform hover:scale-[1.02] transition-transform duration-500 ease-out pointer-events-none select-none"
        />
      </div>

    </div>
  );
};

export default HeroProductVisual;
