/*
Style reminder for this file:
- Visual language should feel adjacent to the 16Personalities character family: geometric, friendly, pastel, low-poly.
- Use simple polygons, soft shadows, and a gentle sense of stage presence.
- Do not drift into glossy 3D, realism, or editorial surrealism.
*/

import type { PersonalityIllustration } from "@/lib/aiBti";

type PersonaAvatarProps = {
  illustration: PersonalityIllustration;
  size?: number;
  background?: string;
  className?: string;
};

function PropShape({ prop, accent }: { prop: string; accent: string }) {
  switch (prop) {
    case "bench":
      return (
        <g>
          <polygon points="24,188 88,188 100,194 35,194" fill="#cfc8d6" />
          <polygon points="35,194 100,194 96,202 31,202" fill="#b7aebf" />
          <rect x="33" y="202" width="8" height="18" fill="#a096aa" />
          <rect x="85" y="202" width="8" height="18" fill="#a096aa" />
        </g>
      );
    case "chart":
      return (
        <g>
          <rect x="150" y="160" width="48" height="58" rx="4" fill="#efe9f6" />
          <rect x="157" y="198" width="8" height="14" fill="#a483c5" />
          <rect x="170" y="186" width="8" height="26" fill="#8f77c6" />
          <rect x="183" y="176" width="8" height="36" fill="#6f5aa8" />
        </g>
      );
    case "console":
      return (
        <g>
          <rect x="150" y="170" width="56" height="34" rx="6" fill="#1e3f46" />
          <path d="M160 184 L170 192 L160 200" stroke="#d0fbff" strokeWidth="4" fill="none" />
          <line x1="176" y1="198" x2="191" y2="198" stroke="#d0fbff" strokeWidth="4" />
        </g>
      );
    case "bubble":
      return (
        <g>
          <rect x="150" y="118" width="54" height="32" rx="12" fill="#f3ecfa" />
          <polygon points="167,150 176,150 170,160" fill="#f3ecfa" />
          <circle cx="165" cy="134" r="3" fill={accent} />
          <circle cx="177" cy="134" r="3" fill={accent} />
          <circle cx="189" cy="134" r="3" fill={accent} />
        </g>
      );
    case "clipboard":
      return (
        <g>
          <rect x="154" y="150" width="38" height="58" rx="6" fill="#f5faf9" />
          <rect x="165" y="144" width="16" height="10" rx="4" fill="#7dbbb4" />
          <line x1="162" y1="168" x2="183" y2="168" stroke="#7dbbb4" strokeWidth="3" />
          <line x1="162" y1="180" x2="183" y2="180" stroke="#7dbbb4" strokeWidth="3" />
        </g>
      );
    case "cards":
      return (
        <g>
          <rect x="152" y="166" width="20" height="30" rx="4" fill="#ffffff" transform="rotate(-12 162 181)" />
          <rect x="166" y="164" width="20" height="30" rx="4" fill="#daf6fb" transform="rotate(6 176 179)" />
          <rect x="180" y="166" width="20" height="30" rx="4" fill="#f2ebff" transform="rotate(16 190 181)" />
        </g>
      );
    case "lens":
      return (
        <g>
          <circle cx="179" cy="174" r="16" fill="none" stroke="#6ea8b4" strokeWidth="6" />
          <line x1="190" y1="186" x2="203" y2="201" stroke="#5b8692" strokeWidth="6" strokeLinecap="round" />
        </g>
      );
    case "hat":
      return (
        <g>
          <ellipse cx="66" cy="72" rx="23" ry="5" fill="#5a8e59" />
          <polygon points="49,69 83,69 74,50 57,50" fill="#79b274" />
        </g>
      );
    case "heart":
      return (
        <g transform="translate(160 146)">
          <circle cx="-7" cy="0" r="8" fill="#f59db0" />
          <circle cx="7" cy="0" r="8" fill="#f59db0" />
          <polygon points="-16,4 16,4 0,25" fill="#ef7f99" />
        </g>
      );
    case "spark":
      return (
        <g>
          <polygon points="177,145 183,160 198,166 183,172 177,187 171,172 156,166 171,160" fill="#f4cb6b" />
        </g>
      );
    case "crystal":
      return (
        <g>
          <circle cx="178" cy="170" r="18" fill="#cfe8d4" />
          <polygon points="178,152 188,166 178,186 168,166" fill="#b8d7c3" />
          <rect x="168" y="188" width="20" height="8" rx="4" fill="#80b38d" />
        </g>
      );
    case "brush":
      return (
        <g>
          <line x1="172" y1="160" x2="196" y2="184" stroke="#8a6c2d" strokeWidth="5" strokeLinecap="round" />
          <polygon points="196,184 202,180 206,188 200,192" fill="#d3a44f" />
        </g>
      );
    case "mask":
      return (
        <g>
          <path d="M164 152 Q178 145 192 152 L188 173 Q178 183 168 173 Z" fill="#f3f1eb" />
          <circle cx="173" cy="161" r="2" fill="#7b5f2d" />
          <circle cx="183" cy="161" r="2" fill="#7b5f2d" />
          <path d="M172 169 Q178 173 184 169" stroke="#7b5f2d" strokeWidth="2" fill="none" />
        </g>
      );
    case "papers":
      return (
        <g>
          <rect x="154" y="160" width="42" height="50" rx="4" fill="#fff8ee" />
          <rect x="160" y="153" width="42" height="50" rx="4" fill="#f9ebcf" />
          <rect x="166" y="146" width="42" height="50" rx="4" fill="#fffdf7" />
        </g>
      );
    case "bag":
      return (
        <g>
          <path d="M163 162 H193 L188 206 H168 Z" fill="#dbb261" />
          <path d="M171 162 Q178 148 185 162" stroke="#8b6a2f" strokeWidth="4" fill="none" />
        </g>
      );
    default:
      return null;
  }
}

function PoseOverlay({ pose, jacket, skin, hair }: { pose: string; jacket: string; skin: string; hair: string }) {
  switch (pose) {
    case "thinking":
      return (
        <g>
          <polygon points="76,129 102,144 89,151 65,137" fill={jacket} />
          <polygon points="97,143 111,128 117,135 102,149" fill={skin} />
        </g>
      );
    case "briefcase":
      return (
        <g>
          <polygon points="103,145 126,156 118,165 97,154" fill={jacket} />
          <line x1="118" y1="163" x2="154" y2="183" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "conduct":
      return (
        <g>
          <line x1="111" y1="150" x2="146" y2="136" stroke={skin} strokeWidth="8" strokeLinecap="round" />
          <line x1="146" y1="136" x2="171" y2="122" stroke="#5a6679" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case "phone":
      return (
        <g>
          <line x1="112" y1="140" x2="133" y2="124" stroke={skin} strokeWidth="8" strokeLinecap="round" />
          <rect x="130" y="114" width="9" height="18" rx="3" fill="#262833" />
        </g>
      );
    case "pointing":
      return (
        <g>
          <line x1="111" y1="150" x2="149" y2="150" stroke={skin} strokeWidth="8" strokeLinecap="round" />
          <circle cx="149" cy="150" r="4" fill={skin} />
        </g>
      );
    case "typing":
      return (
        <g>
          <line x1="110" y1="150" x2="142" y2="166" stroke={skin} strokeWidth="8" strokeLinecap="round" />
          <line x1="74" y1="150" x2="56" y2="166" stroke={skin} strokeWidth="8" strokeLinecap="round" />
          <rect x="44" y="164" width="104" height="12" rx="4" fill="#24434a" opacity="0.32" />
        </g>
      );
    case "shuffle":
      return (
        <g>
          <line x1="111" y1="152" x2="152" y2="176" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "magnifier":
      return (
        <g>
          <line x1="110" y1="152" x2="158" y2="170" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "greet":
      return (
        <g>
          <line x1="112" y1="145" x2="136" y2="120" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "heart":
      return (
        <g>
          <line x1="111" y1="152" x2="154" y2="160" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "letter":
      return (
        <g>
          <line x1="110" y1="154" x2="150" y2="164" stroke={skin} strokeWidth="8" strokeLinecap="round" />
          <rect x="150" y="154" width="28" height="18" rx="3" fill="#fff7ee" />
          <path d="M150 158 L164 168 L178 158" stroke={hair} strokeWidth="2.5" fill="none" />
        </g>
      );
    case "oracle":
      return (
        <g>
          <line x1="111" y1="152" x2="154" y2="168" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "paint":
      return (
        <g>
          <line x1="111" y1="151" x2="165" y2="174" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "laugh":
      return (
        <g>
          <line x1="111" y1="154" x2="154" y2="164" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "stack":
      return (
        <g>
          <line x1="111" y1="154" x2="152" y2="170" stroke={skin} strokeWidth="8" strokeLinecap="round" />
        </g>
      );
    case "question":
      return (
        <g>
          <line x1="111" y1="154" x2="160" y2="184" stroke={skin} strokeWidth="8" strokeLinecap="round" />
          <circle cx="157" cy="130" r="14" fill="#fff8ee" />
          <path d="M151 128 Q151 120 159 120 Q166 120 166 127 Q166 131 161 134 Q158 136 158 140" stroke="#8a6c2d" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="158" cy="145" r="2" fill="#8a6c2d" />
        </g>
      );
    default:
      return null;
  }
}

export function PersonaAvatar({
  illustration,
  size = 180,
  background = "transparent",
  className,
}: PersonaAvatarProps) {
  return (
    <div className={className} style={{ width: size, height: size * 1.22 }}>
      <svg
        viewBox="0 0 220 240"
        role="img"
        aria-hidden="true"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <rect width="220" height="240" rx="24" fill={background} />
        <ellipse cx="109" cy="220" rx="60" ry="10" fill="#000" opacity="0.08" />

        <PropShape prop={illustration.prop} accent={illustration.jacket} />

        <polygon points="77,100 109,87 140,101 128,149 92,149" fill={illustration.jacket} />
        <polygon points="77,100 109,87 102,120 92,149 68,134" fill={illustration.jacket} opacity="0.9" />
        <polygon points="109,87 140,101 148,135 128,149 102,120" fill="#000" opacity="0.08" />

        <polygon points="92,149 110,149 103,197 85,217 73,212" fill={illustration.pants} />
        <polygon points="110,149 128,149 136,212 121,217 103,197" fill={illustration.pants} opacity="0.88" />
        <polygon points="85,217 105,217 102,225 80,225" fill={illustration.shoe} />
        <polygon points="120,217 139,217 141,225 119,225" fill={illustration.shoe} />

        <polygon points="92,98 109,110 126,98 121,132 97,132" fill={illustration.shirt} />
        <polygon points="109,110 121,132 97,132" fill="#000" opacity="0.08" />

        <polygon points="68,132 92,146 89,157 65,144" fill={illustration.jacket} opacity="0.9" />
        <polygon points="128,146 150,136 155,147 132,158" fill={illustration.jacket} opacity="0.96" />
        <polygon points="62,142 74,144 68,177 58,173" fill={illustration.skin} />
        <polygon points="147,146 159,149 154,182 143,178" fill={illustration.skin} />

        <PoseOverlay
          pose={illustration.pose}
          jacket={illustration.jacket}
          skin={illustration.skin}
          hair={illustration.hair}
        />

        <polygon points="87,46 111,38 133,46 138,72 122,90 95,89 81,73" fill={illustration.skin} />
        <polygon points="87,46 111,38 106,66 95,89 81,73" fill={illustration.skin} opacity="0.86" />
        <polygon points="111,38 133,46 138,72 122,90 106,66" fill="#000" opacity="0.08" />

        <polygon points="80,48 92,32 117,25 144,34 149,52 140,61 126,52 108,56 94,63 81,58" fill={illustration.hair} />
        <polygon points="108,56 140,61 145,79 126,85 108,73" fill={illustration.hair} opacity="0.9" />
        <polygon points="82,59 95,64 93,86 80,79" fill={illustration.hair} opacity="0.92" />

        <circle cx="101" cy="67" r="2.5" fill="#47352d" />
        <circle cx="121" cy="67" r="2.5" fill="#47352d" />
        <path d="M99 79 Q111 86 124 79" stroke="#7d5a4a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
