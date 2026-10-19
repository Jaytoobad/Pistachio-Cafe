from pathlib import Path
import re
modified = 0
for f in Path('src').rglob('*.jsx'):
    try:
        t = f.read_text(errors='ignore')
        def repl(m):
            tag = m.group(0)
            if 'width=' in tag.lower() or 'height=' in tag.lower():
                return tag
            return tag.replace('<svg', '<svg width="20" height="20"')
        new_t, n = re.subn(r'<svg[^>]*>', repl, t)
        if n > 0 and new_t != t:
            f.write_text(new_t, encoding='utf-8', errors='ignore')
            modified += 1
    except Exception:
        pass
print(modified)
