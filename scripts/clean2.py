path = "src/storefront/components/StorefrontLayout.jsx"
with open(path,'r',encoding='utf-8',errors='ignore') as f:
    s = f.read()
s = s.replace('Facebook', '')
s = s.replace('TikTok', '')
s = s.replace('<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5H16l.5-3H13.5V8.3c0-.87.24-1.46 1.5-1.46H16.6V4.14C16.34 4.1 15.44 4 14.4 4c-2.17 0-3.66 1.32-3.66 3.75v2.75H8.2v3h2.54V21h2.76z"/></svg>', '')
s = s.replace('<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 3H22l-7.6 8.7L23 21h-6.9l-5.4-6.6L4.5 21H1.4l8.1-9.3L1 3h7l4.9 6z"/></svg>', '')
s = s.replace('<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 2h-3.1v13.4a2.6 2.6 0 1 1-2-2.53v-3.15A5.75 5.75 0 1 0 16.5 13V8.1a7.3 7 0 0 0 4 1.2V6.2a4.2 4.2 0 0 1-4-4.2z"/></svg>', '')
s = s.replace('                )}', '')
s = s.replace('                )\n', '\n')
with open(path,'w',encoding='utf-8',errors='ignore') as f:
    f.write(s)
print('ok')
