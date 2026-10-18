/**
 * Mojeeb's leopard — layered SVG rig.
 *
 * Vector redraw of the supplied character sheet (palette, bold outlines, rosettes, cream bib,
 * pink inner ears, ringed tail). Status: v1 redraw pending approval — swap in source artwork when supplied.
 * Poses and expressions are composed from shared parts with CSS (components/mascot/mascot.css):
 * - pose: sit | walk | reach | look | celebrate
 * - expression: happy | curious | playful
 * Look direction is driven by the CSS variables --lx / --ly (-1…1) on any ancestor.
 */
import type { CSSProperties } from "react";

export type LeopardPose = "sit" | "walk" | "reach" | "look" | "celebrate";
export type LeopardExpression = "happy" | "curious" | "playful";

type Props = {
  pose?: LeopardPose;
  expression?: LeopardExpression;
  size?: number | string;
  className?: string;
  title?: string;
  style?: CSSProperties;
};

const O = "#111111";

function Spots({ dots }: { dots: [number, number, number, number?][] }) {
  return (
    <g className="lp-spots">
      {dots.map(([cx, cy, rx, ry], i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry ?? rx * 0.8} />
      ))}
    </g>
  );
}

/** Head, shared by the full rig and the peeking variant. */
export function LeopardHead() {
  return (
    <g className="lp-head">
      {/* ears */}
      <g className="lp-ear lp-ear--l">
        <path d="M70 70 L60 28 Q60 18 70 21 L100 44 Z" className="lp-fur lp-line" />
        <path d="M74 58 L68 33 L91 47 Z" className="lp-ear-in" />
      </g>
      <g className="lp-ear lp-ear--r">
        <path d="M170 70 L180 28 Q180 18 170 21 L140 44 Z" className="lp-fur lp-line" />
        <path d="M166 58 L172 33 L149 47 Z" className="lp-ear-in" />
      </g>
      {/* head with cheek tufts */}
      <path
        className="lp-fur lp-line"
        d="M63 98 C52 70 70 34 120 34 C170 34 188 70 177 98 L189 104 L176 108 L183 118 L167 115 C155 129 138 134 120 134 C102 134 85 129 73 115 L57 118 L64 108 L51 104 Z"
      />
      <path className="lp-shade" d="M72 112 C86 126 104 131 120 131 C136 131 154 126 168 112 C150 120 90 120 72 112 Z" />
      <Spots
        dots={[
          [108, 47, 3.4], [121, 43, 3.6], [134, 48, 3.2], [99, 57, 3], [143, 57, 3.2],
          [114, 56, 2.2], [128, 56, 2.2], [77, 76, 4.2, 3.4], [164, 76, 4.2, 3.4],
          [70, 90, 3], [171, 90, 3], [84, 64, 2.6], [157, 64, 2.6],
        ]}
      />
      {/* muzzle */}
      <ellipse cx="120" cy="106" rx="27" ry="18" className="lp-light" />
      {/* eyes: happy (closed arcs) */}
      <g className="lp-eyes lp-eyes--happy">
        <path d="M89 88 Q98 78 107 88" />
        <path d="M133 88 Q142 78 151 88" />
      </g>
      {/* eyes: open (curious) */}
      <g className="lp-eyes lp-eyes--open">
        <g className="lp-eye">
          <ellipse cx="98" cy="86" rx="10" ry="11.5" className="lp-sclera" />
          <g className="lp-pupil"><circle cx="99" cy="87" r="6.6" /><circle cx="101.4" cy="84.2" r="2.1" className="lp-glint" /></g>
        </g>
        <g className="lp-eye">
          <ellipse cx="142" cy="86" rx="10" ry="11.5" className="lp-sclera" />
          <g className="lp-pupil"><circle cx="143" cy="87" r="6.6" /><circle cx="145.4" cy="84.2" r="2.1" className="lp-glint" /></g>
        </g>
      </g>
      {/* eyes: playful (wink + open) */}
      <g className="lp-eyes lp-eyes--playful">
        <path d="M89 88 Q98 78 107 88" className="lp-wink" />
        <g className="lp-eye">
          <ellipse cx="142" cy="86" rx="10" ry="11.5" className="lp-sclera" />
          <g className="lp-pupil"><circle cx="143" cy="87" r="6.6" /><circle cx="145.4" cy="84.2" r="2.1" className="lp-glint" /></g>
        </g>
      </g>
      {/* nose + mouth */}
      <path d="M113 98 Q120 93 127 98 Q125 104.5 120 106 Q115 104.5 113 98 Z" className="lp-nose" />
      <path className="lp-mouth lp-mouth--smile" d="M120 106 L120 109.5 M110 108.5 Q115 115 120 109.5 Q125 115 130 108.5" />
      <g className="lp-mouth--open">
        <path d="M108 108 Q120 106 132 108 Q130 124 120 125 Q110 124 108 108 Z" className="lp-mouth-in" />
        <path d="M113 118 Q120 113 127 118 Q124 124 120 124 Q116 124 113 118 Z" className="lp-tongue" />
      </g>
      {/* whiskers */}
      <g className="lp-whiskers">
        <path d="M95 104 L68 99" /><path d="M95 109 L70 112" />
        <path d="M145 104 L172 99" /><path d="M145 109 L170 112" />
      </g>
    </g>
  );
}

export function LeopardPaw({ x, y }: { x: number; y: number }) {
  return (
    <g className="lp-paw">
      <ellipse cx={x} cy={y} rx="14.5" ry="10" className="lp-light lp-line" />
      <path d={`M${x - 4.5} ${y + 1} v6 M${x + 4.5} ${y + 1} v6`} className="lp-toe" />
    </g>
  );
}

export default function Leopard({ pose = "sit", expression = "happy", size = 200, className = "", title, style }: Props) {
  const labelled = Boolean(title);
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={`leopard lp-pose--${pose} lp-expr--${expression} ${className}`}
      style={{ ["--lp-outline" as string]: O, ...style }}
      role={labelled ? "img" : undefined}
      aria-label={title}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
    >
      <ellipse cx="120" cy="223" rx="70" ry="7" className="lp-ground" />
      {/* tail: outline, fur, rings */}
      <g className="lp-tail">
        <path d="M84 206 C38 214 22 176 44 156 C56 146 72 154 66 168" className="lp-tail-o" />
        <path d="M84 206 C38 214 22 176 44 156 C56 146 72 154 66 168" className="lp-tail-f" />
        <path d="M84 206 C38 214 22 176 44 156 C56 146 72 154 66 168" className="lp-tail-r" />
      </g>
      <g className="lp-body-wrap">
        {/* haunches */}
        <ellipse cx="82" cy="199" rx="22" ry="17" className="lp-fur lp-line lp-haunch" />
        <ellipse cx="158" cy="199" rx="22" ry="17" className="lp-fur lp-line lp-haunch" />
        {/* body */}
        <path d="M78 212 C64 178 76 132 120 130 C164 132 176 178 162 212 Z" className="lp-fur lp-line" />
        <path d="M97 138 C103 168 108 194 120 204 C132 194 137 168 143 138 C132 148 108 148 97 138 Z" className="lp-light" />
        <Spots dots={[[88, 168, 5, 4], [151, 166, 5, 4], [84, 187, 4.4, 3.6], [156, 186, 4.4, 3.6], [94, 152, 3.4], [146, 150, 3.4], [71, 198, 3.4], [169, 198, 3.4], [92, 204, 2.6], [148, 204, 2.6]]} />
        <g className="lp-feet">
          <g className="lp-foot lp-foot--l"><LeopardPaw x={103} y={211} /></g>
          <g className="lp-foot lp-foot--r"><LeopardPaw x={137} y={211} /></g>
        </g>
      </g>
      <LeopardHead />
      {/* raised arm (reach / celebrate) */}
        <g className="lp-arm lp-arm--r">
          <path d="M150 152 C166 144 178 128 186 108" className="lp-arm-o" />
          <path d="M150 152 C166 144 178 128 186 108" className="lp-arm-f" />
          <circle cx="190" cy="98" r="15" className="lp-light lp-line" />
          <g className="lp-beans">
            <ellipse cx="190" cy="102" rx="6" ry="4.6" />
            <circle cx="181.5" cy="93.5" r="2.6" /><circle cx="187" cy="89" r="2.6" /><circle cx="193.5" cy="89" r="2.6" /><circle cx="199" cy="93.5" r="2.6" />
          </g>
        </g>
        <g className="lp-arm lp-arm--l">
          <path d="M90 152 C74 144 62 128 54 108" className="lp-arm-o" />
          <path d="M90 152 C74 144 62 128 54 108" className="lp-arm-f" />
          <circle cx="50" cy="98" r="15" className="lp-light lp-line" />
          <g className="lp-beans">
            <ellipse cx="50" cy="102" rx="6" ry="4.6" />
            <circle cx="41" cy="93.5" r="2.6" /><circle cx="47" cy="89" r="2.6" /><circle cx="53.5" cy="89" r="2.6" /><circle cx="59" cy="93.5" r="2.6" />
          </g>
        </g>
    </svg>
  );
}

/** Small resting icon: curled up, asleep. */
export function LeopardRest({ size = 96, className = "", title }: { size?: number; className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 132 80" width={size} height={(size * 80) / 132} className={`leopard leopard--rest ${className}`} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <ellipse cx="66" cy="74" rx="56" ry="4.5" className="lp-ground" />
      <g className="lp-rest-body">
        <path d="M14 62 C8 40 30 26 58 26 C84 26 100 36 104 52 C106 64 96 72 80 72 L28 72 C20 72 15 68 14 62 Z" className="lp-fur lp-line" />
        <Spots dots={[[34, 44, 4], [50, 36, 3.6], [66, 40, 4], [44, 56, 3.4], [82, 48, 3.4], [26, 58, 3], [60, 60, 3]]} />
        <path d="M24 70 C40 78 74 78 92 70 C100 66 106 60 112 62" className="lp-tail-o lp-tail-o--sm" />
        <path d="M24 70 C40 78 74 78 92 70 C100 66 106 60 112 62" className="lp-tail-f lp-tail-f--sm" />
        <path d="M24 70 C40 78 74 78 92 70 C100 66 106 60 112 62" className="lp-tail-r lp-tail-r--sm" />
      </g>
      <g className="lp-rest-head">
        <path d="M86 36 L84 18 Q85 13 90 16 L98 26 Z" className="lp-fur lp-line" />
        <path d="M112 34 L118 18 Q120 13 123 18 L122 32 Z" className="lp-fur lp-line" />
        <path d="M88 26 C98 22 114 22 122 30 C130 40 126 58 108 60 C94 61 82 52 84 40 C84 34 85 29 88 26 Z" className="lp-fur lp-line" />
        <ellipse cx="106" cy="50" rx="11" ry="7" className="lp-light" />
        <path d="M94 42 Q98 45 102 42 M110 42 Q114 45 118 42" className="lp-closed" />
        <path d="M103.5 47 Q106 45.5 108.5 47 Q107.5 49.5 106 50 Q104.5 49.5 103.5 47 Z" className="lp-nose lp-nose--sm" />
        <circle cx="96" cy="31" r="1.8" className="lp-dot" /><circle cx="104" cy="28" r="2" className="lp-dot" /><circle cx="113" cy="30" r="1.8" className="lp-dot" />
      </g>
      <g className="lp-zzz" aria-hidden="true">
        <text x="114" y="16">z</text><text x="122" y="9">z</text>
      </g>
    </svg>
  );
}

/** Peeking over an edge: head + two paws. Used for discoveries and easter eggs. */
export function LeopardPeek({ size = 120, className = "", expression = "curious" }: { size?: number; className?: string; expression?: LeopardExpression }) {
  return (
    <svg viewBox="40 14 160 128" width={size} height={(size * 128) / 160} className={`leopard leopard--peek lp-expr--${expression} ${className}`} aria-hidden="true" focusable="false">
      <LeopardHead />
      <g className="lp-peek-paws">
        <ellipse cx="88" cy="134" rx="16" ry="10" className="lp-light lp-line" />
        <ellipse cx="152" cy="134" rx="16" ry="10" className="lp-light lp-line" />
        <path d="M83 134 v5 M93 134 v5 M147 134 v5 M157 134 v5" className="lp-toe" />
      </g>
    </svg>
  );
}
