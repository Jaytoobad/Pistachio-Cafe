path = "src/storefront/config.js"
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()
new_func = """export function isPlaceholderContact(value) {
  if (!value) return true;
  const v = String(value);
  const digits = v.replace(/[^0-9]/g, "");
  if (!digits) return true;
  if (digits === "233000000000") return true;
  if (/^0+$/.test(digits)) return true;
  if (digits.includes("0000000000")) return true;
  return false;
}"""
import re
pattern = r"export function isPlaceholderContact\([^}]*\}"
m = re.search(pattern, s, re.DOTALL)
if m:
    s = s[:m.start()] + new_func + s[m.end():]
    with open(path, 'w', encoding='utf-8') as f:
        f.write(s)
    print('done')
else:
    print('notfound')
