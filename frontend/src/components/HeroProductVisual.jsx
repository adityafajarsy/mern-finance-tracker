import hpHeroImage from "../assets/hp_hero.webp";
import HeroDemoCard from "./HeroDemoCard";

export const HeroProductVisual = ({ className = "" }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      
      {/* Proportional 3D iPhone Visual with 2XL Responsive Scaling */}
      <div className="relative w-64 sm:w-76 md:w-88 lg:w-95 2xl:w-120 flex items-center justify-center">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 bg-[#00A86B]/15 blur-3xl rounded-full transform scale-75 -z-10 pointer-events-none" />

        <img
          src={hpHeroImage}
          alt="SALDO Mobile App Preview"
          className="w-full h-auto max-h-125 2xl:max-h-170 object-contain drop-shadow-[0_25px_40px_rgba(8,36,27,0.22)] transform hover:scale-[1.02] transition-transform duration-500 ease-out pointer-events-none select-none"
        />

        {/* Floating Animated Demo Card (Desktop & Tablet only) */}
        <HeroDemoCard className="hidden md:block absolute -right-6 sm:-right-8 lg:-right-14 2xl:-right-20 bottom-10 lg:bottom-16 z-20" />
      </div>

    </div>
  );
};

export default HeroProductVisual;
