import json
import glob

subete_questions = []
selectcount_questions = []
inconsistent = []

# Search all question JSON files
for file_path in sorted(glob.glob('data/questions/**/*.json', recursive=True)):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        for i, question in enumerate(data.get('questions', []), 1):
            q_text = question.get('question', '')
            has_subete = 'すべて選べ' in q_text
            has_selectcount = 'selectCount' in question
            
            if has_subete:
                subete_questions.append({
                    'file': file_path.replace('\\', '/'),
                    'id': question.get('id'),
                    'question': q_text[:60] + ('...' if len(q_text) > 60 else ''),
                    'has_selectcount': has_selectcount
                })
            
            if has_selectcount:
                selectcount_questions.append({
                    'file': file_path.replace('\\', '/'),
                    'id': question.get('id'),
                    'selectcount': question.get('selectCount'),
                    'has_subete': has_subete
                })
            
            if has_subete and has_selectcount:
                inconsistent.append({
                    'file': file_path.replace('\\', '/'),
                    'id': question.get('id'),
                    'question': q_text,
                    'selectCount': question.get('selectCount')
                })
    except Exception as e:
        print(f'Error reading {file_path}: {e}')

print(f"=== ANALYSIS RESULTS ===\n")
print(f"Total questions with 'すべて選べ': {len(subete_questions)}")
print(f"Total questions with 'selectCount': {len(selectcount_questions)}")
print(f"Questions with BOTH (INCONSISTENCY): {len(inconsistent)}\n")

if inconsistent:
    print("INCONSISTENT QUESTIONS FOUND:")
    for r in inconsistent:
        print(f"\nFile: {r['file']}")
        print(f"ID: {r['id']}")
        print(f"Question: {r['question']}")
        print(f"SelectCount: {r['selectCount']}")
else:
    print("✓ NO INCONSISTENCIES FOUND")
    print("\nSummary of 'すべて選べ' questions (should have NO selectCount):")
    for q in subete_questions:
        status = "✓ OK" if not q['has_selectcount'] else "✗ ERROR"
        print(f"  {status} - {q['file']}: {q['id']}")
