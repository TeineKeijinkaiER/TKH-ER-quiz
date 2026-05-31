import json
import glob
import os

inconsistent_questions = []

for file_path in sorted(glob.glob('data/questions/**/*.json', recursive=True)):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for i, question in enumerate(data.get('questions', []), 1):
            q_text = question.get('question', '')
            has_subete = 'すべて選べ' in q_text or 'すべて選択せよ' in q_text
            has_selectcount = 'selectCount' in question
            
            if has_subete and has_selectcount:
                inconsistent_questions.append({
                    'file': file_path.replace('\\', '/'),
                    'id': question.get('id'),
                    'question': q_text,
                    'selectCount': question.get('selectCount'),
                    'answers': question.get('answers') or question.get('answer')
                })
    except Exception as e:
        print(f'Error reading {file_path}: {e}')

print(f"Total inconsistent questions: {len(inconsistent_questions)}")
for q in inconsistent_questions[:10]:
    print(f"- {q['file']} (ID: {q['id']}): selectCount={q['selectCount']}, answers={q['answers']}")

# Save the full list as a JSON for further analysis
os.makedirs('scratch', exist_ok=True)
with open('scratch/inconsistent_questions.json', 'w', encoding='utf-8') as f:
    json.dump(inconsistent_questions, f, ensure_ascii=False, indent=2)
print("Saved full list to scratch/inconsistent_questions.json")
