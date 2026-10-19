path = "src/styles/storefront.css"
with open(path,'r',encoding='utf-8') as f:
    s = f.read()
css = '''\n.newsletter-form { display: flex; margin-top: 0.75rem; width: 100%; }\n.newsletter-form input { flex: 1; height: 44px; border-radius: 4px 0 0 4px; padding: 0 0.9em; }\n.newsletter-form button { height: 44px; border-radius: 0 4px 4px 0; background: var(--old-marigold, var(--marigold, #E7A33E)); color: #1F2A22; border: 1.5px solid var(--old-marigold, var(--marigold, #E7A33E)); padding: 0 1em; font-weight: 700; cursor: pointer; }\n'''
s += css
with open(path,'w',encoding='utf-8') as f:
    f.write(s)
print('ok')
