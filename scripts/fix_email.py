path = "src/storefront/config.js"
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()
old = "export const HAS_EMAIL = !isPlaceholderContact(CONTACT.email);"
new = "export const HAS_EMAIL = !(isPlaceholderContact(CONTACT.email) || CONTACT.email === 'hello@pistachio.cafe');"
if old in s:
    s = s.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(s)
    print('done')
else:
    print('no')
