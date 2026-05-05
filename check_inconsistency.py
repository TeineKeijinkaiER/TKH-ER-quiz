import json
import glob

results = []

# Search all question JSON files
for file_path in sorted(glob.glob('data/questions/**/*.json', recursive=True)):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for i, question in enumerate(data.get('questions', []), 1):
            # Check if question text contains 'すべて選べ' AND has selectCount field
            q_text = question.get('question', '')
            if 'すべて選べ' in q_text and 'selectCount' in question:
                # Find line number in the original file
                with open(file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                
                # Find where selectCount appears in this question
                selectCount_line = None
                for line_num, line in enumerate(lines, 1):
                    if '"selectCount"' in line:
                        selectCount_line = line_num
                
                results.append({
                    'file': file_path.replace('\\', '/'),
                    'id': question.get('id', 'N/A'),
                    'question': q_text,
                    'selectCount': question.get('selectCount'),
                    'selectCount_line': selectCount_line,
                    'answers_count': len(question.get('answers', []))
                })
    except Exception as e:
        print(f'Error reading {file_path}: {e}')

if results:
    print(f'FOUND {len(results)} INCONSISTENCIES:\n')
    for r in results:
        print(f"File: {r['file']}")
        print(f"ID: {r['id']}")
        print(f"Question: {r['question']}")
        print(f"SelectCount Value: {r['selectCount']} (line {r['selectCount_line']})")
        print(f"Actual correct answers count: {r['answers_count']}")
        print("-" * 80)
else:
    print('No inconsistencies found (GOOD!)')
