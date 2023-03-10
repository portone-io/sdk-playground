export function toJs(object: object, indent = "  ", level = 0): string {
  const i = Array(level).fill(indent).join("");
  const ii = Array(level + 1).fill(indent).join("");
  const entries = Object.entries(object);
  if (entries.length < 1) return "{}";
  return `{\n${
    entries.map(([key, value]) => {
      const k = /^[_$a-z][_$a-z0-9]*$/i.test(key) ? key : JSON.stringify(key);
      if (
        (value != null) &&
        (typeof value === "object") &&
        (!Array.isArray(value))
      ) {
        return `${ii}${k}: ${toJs(value, indent, level + 1)},\n`;
      } else {
        return `${ii}${k}: ${JSON.stringify(value)},\n`;
      }
    }).join("")
  }${i}}`;
}
