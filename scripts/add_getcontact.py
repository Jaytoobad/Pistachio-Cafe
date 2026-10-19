path = "src/storefront/config.js"
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()
helper = """
export function getContact() {
  const c = { ...CONTACT };
  if (isPlaceholderContact(c.phone)) c.phone = null;
  if (isPlaceholderContact(c.whatsapp)) c.whatsapp = null;
  if (isPlaceholderContact(c.email) || c.email === 'hello@pistachio.cafe') c.email = null;
  return c;
}
"""
if 'getContact' not in s:
    s += helper
    with open(path, 'w', encoding='utf-8') as f:
        f.write(s)
    print('done')
else:
    print('exists')
