import { type PersonalityType } from "@/lib/aiBti";

type PersonaAvatarProps = {
  type: string;
  size?: number | string; 
  background?: string;
  className?: string;
  radius?: string;
  forExport?: boolean;
};

export function PersonaAvatar({
  type,
  size = "100%",
  background = "transparent",
  className,
  radius = "12px",
  forExport,
}: PersonaAvatarProps) {
  const imagePath = typeof window !== 'undefined' ? `${window.location.origin}/illustrations/${type}.png` : `/illustrations/${type}.png`;

  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden ${className || ""}`}
      style={{ 
        width: typeof size === "number" ? `${size}px` : size, 
        aspectRatio: className?.includes("aspect-") ? undefined : "1 / 1.15", 
        backgroundColor: background,
        borderRadius: radius
      }}
    >
      <img
        src={imagePath}
        alt={`${type} personality illustration`}
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/illustrations/POOR.png";
        }}
        style={{ display: "block" }}
        loading="eager"
      />
      
      {!forExport && (
        <div 
          className="absolute bottom-2 left-1/2 h-4 w-3/4 -translate-x-1/2 rounded-full bg-black/5 blur-md"
          style={{ zIndex: -1 }}
        />
      )}
    </div>
  );
}
