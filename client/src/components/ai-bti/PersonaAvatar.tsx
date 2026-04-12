import { type PersonalityType } from "@/lib/aiBti";

type PersonaAvatarProps = {
  type: string;
  size?: number | string; 
  background?: string;
  className?: string;
  radius?: string;
};

export function PersonaAvatar({
  type,
  size = "100%",
  background = "transparent",
  className,
  radius = "12px",
}: PersonaAvatarProps) {
  const imagePath = `/illustrations/${type}.png`;

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden ${className || ""}`}
      style={{ 
        width: typeof size === "number" ? `${size}px` : size, 
        aspectRatio: "1 / 1.15", 
        backgroundColor: background,
        borderRadius: radius
      }}
    >
      <img
        src={imagePath}
        alt={`${type} personality illustration`}
        className="h-full w-full object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/illustrations/POOR.png";
        }}
        style={{ display: "block" }}
      />
      
      {/* Shadow */}
      <div 
        className="absolute bottom-2 left-1/2 h-4 w-3/4 -translate-x-1/2 rounded-full bg-black/5 blur-md"
        style={{ zIndex: -1 }}
      />
    </div>
  );
}
