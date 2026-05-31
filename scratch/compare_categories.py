import json

with open('data/categories.ja.json', 'r', encoding='utf-8') as f:
    ja_cat = json.load(f)
    
with open('data/categories.en.json', 'r', encoding='utf-8') as f:
    en_cat = json.load(f)

ja_ids = [c.get('id') for c in ja_cat]
en_ids = [c.get('id') for c in en_cat]

if ja_ids == en_ids:
    print("Category IDs match perfectly!")
else:
    print("Category IDs mismatch!")
    print("JA IDs:", ja_ids)
    print("EN IDs:", en_ids)
