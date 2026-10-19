path = "src/storefront/config.js"
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()
new_func = """export function isPlaceholderContact(value) {
  if (!value) return true;
  const digits = String(value).replace(/\\D/g, '');
  if (!digits) return true;
  if (digits === '233000000000') return true;
  if (/^0+$/.test(digits)) return true;
  if (digits.includes('0000000000')) return true;
  return false;
}"""
# find and replace old function
import re
pattern = r'export function isPlaceholderContact\([^\}]+\}'
if re.search(pattern, s, re.DOTALL):
    s = re.sub(pattern, new_func, s, flags=re.DOTALL)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(s)
    print('done')
else:
    print('notfound')
