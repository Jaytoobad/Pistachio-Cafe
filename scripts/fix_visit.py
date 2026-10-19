path = "src/storefront/components/StorefrontLayout.jsx"
with open(path, 'r', encoding='utf-8') as f:
    s = f.read()
# replace Visit section
old = """            <div>
              <h4>Visit</h4>
              <ul className=\"footer-links\">
                <li>{CONTACT.address}</li>
                {HAS_PHONE && <li><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></li>}
                {HAS_WHATSAPP && <li><a href={`https://wa.me/${CONTACT.whatsapp}`}>WhatsApp</a></li>}
                {HAS_EMAIL && <li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>}
                <li>Monâ€“Fri 8AMâ€“11PM Â· Satâ€“Sun 8AMâ€“12AM</li>
              </ul>
            </div>"""
new = """            <div>
              <h4>Visit</h4>
              <ul className=\"footer-links\">
                <li>{CONTACT.address}</li>
                {HAS_PHONE && CONTACT.phone && !/\\D/.test(CONTACT.phone.replace(/\\D/g,'')) && (String(CONTACT.phone).replace(/\\D/g,'') !== '233000000000') && !/^0+$/.test(CONTACT.phone.replace(/\\D/g,'')) ? (<li><a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></li>) : null}
                {HAS_WHATSAPP && CONTACT.whatsapp && String(CONTACT.whatsapp).replace(/\\D/g,'') !== '233000000000' && !/^0+$/.test(CONTACT.whatsapp.replace(/\\D/g,'')) && (<li><a href={`https://wa.me/${CONTACT.whatsapp}`}>WhatsApp</a></li>)}
                {HAS_EMAIL && CONTACT.email && CONTACT.email !== 'hello@pistachio.cafe' && (<li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>)}
                <li>Monâ€“Fri 8AMâ€“11PM Â· Satâ€“Sun 8AMâ€“12AM</li>
              </ul>
            </div>"""
if old in s:
    s = s.replace(old, new)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(s)
    print('done')
else:
    print('no')
