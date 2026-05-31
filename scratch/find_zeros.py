import json
import glob

zero_select_count = []

for file_path in sorted(glob.glob('data/questions/**/*.json', recursive=True)):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for i, question in enumerate(data.get('questions', []), 1):
            if 'selectCount' in question and question.get('selectCount') == 0:
                zero_select_count.append({
                    'file': file_path.replace('\\', '/'),
                    'id': question.get('id'),
                    'question': question.get('question'),
                    'answers': question.get('answers') or question.get('answer')
                })
    except Exception as e:
        print(f'Error reading {file_path}: {e}')

print(f"Total questions with selectCount = 0: {len(zero_select_count)}")
for q in zero_select_count[:10]:
    print(f"- {q['file']} (ID: {q['id']}): answers={q['answers']}")
