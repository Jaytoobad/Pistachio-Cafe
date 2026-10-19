path = "src/storefront/components/StorefrontLayout.jsx"
with open(path,'r',encoding='utf-8',errors='ignore') as f:
    s = f.read()
s = s.replace('{HAS_PHONE && <li><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></li>}', 
              '{HAS_PHONE && CONTACT.phone && String(CONTACT.phone).replace(/\\D/g,"") !== "233000000000" && !/^0+$/.test(String(CONTACT.phone).replace(/\\D/g,"")) && <li><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></li>}')
s = s.replace('{HAS_WHATSAPP && <li><a href={`https://wa.me/${CONTACT.whatsapp}`}>WhatsApp</a></li>}',
              '{HAS_WHATSAPP && CONTACT.whatsapp && String(CONTACT.whatsapp).replace(/\\D/g,"") !== "233000000000" && !/^0+$/.test(String(CONTACT.whatsapp).replace(/\\D/g,"")) && <li><a href={`https://wa.me/${CONTACT.whatsapp}`}>WhatsApp</a></li>}')
s = s.replace('{HAS_EMAIL && <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>}',
              '{HAS_EMAIL && CONTACT.email && CONTACT.email !== "hello@pistachio.cafe" && <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>}')
with open(path,'w',encoding='utf-8',errors='ignore') as f:
    f.write(s)
print('ok')
