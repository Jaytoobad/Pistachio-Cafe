path = "src/styles/storefront.css"
with open(path,'r',encoding='utf-8') as f:
    s = f.read()
css = '''\n/* Footer responsive overrides */\n.site-footer .container { max-width: 1200px; padding: 48px 24px 0; }\n@media (max-width: 768px) {\n  .footer-grid { grid-template-columns: 1fr 1fr; }\n  .footer-grid > div:first-child,\n  .footer-grid > div:last-child { grid-column: 1 / -1; }\n  .footer-bottom { flex-direction: column; align-items: center; text-align: center; gap: 8px; }\n  .newsletter-form { width: 100%; max-width: 100%; }\n}\n'''
if '.footer-grid' not in s or 'site-footer .container' not in s:
    # just add
    s += css
    with open(path,'w',encoding='utf-8') as f:
        f.write(s)
    print('added')
else:
    print('check')
