import { toolGroups, type ToolIcon } from "@/content/tools";

/** Colour from the brand hex unless it is too dark to read on the dark theme, then currentColor. */
function isDark(hex?: string) {
  if (!hex) return true;
  const n = parseInt(hex, 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.28;
}

function Tile({ tool }: { tool: ToolIcon }) {
  return (
    <li className="tool-tile" title={tool.name}>
      {tool.path ? (
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" style={{ color: isDark(tool.hex) ? "var(--ink)" : `#${tool.hex}` }}>
          <path d={tool.path} fill="currentColor" />
        </svg>
      ) : (
        <span className="tool-tile__mono" aria-hidden="true">{tool.monogram}</span>
      )}
      <span className="sr-only">{tool.name}</span>
    </li>
  );
}

export default function ToolTiles({ groups = toolGroups }: { groups?: typeof toolGroups }) {
  return (
    <div className="tool-groups">
      {groups.map((g) => (
        <div key={g.label} className="tool-group">
          <h3 className="label">{g.label}</h3>
          <ul role="list" className="tool-row">{g.tools.map((t) => <Tile key={t.name} tool={t} />)}</ul>
        </div>
      ))}
    </div>
  );
}
