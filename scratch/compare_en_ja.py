import json
import glob
import os

ja_dir = 'data/questions/ja'
en_dir = 'data/questions/en'

ja_files = set(os.path.relpath(p, ja_dir) for p in glob.glob(os.path.join(ja_dir, '**/*.json'), recursive=True))
en_files = set(os.path.relpath(p, en_dir) for p in glob.glob(os.path.join(en_dir, '**/*.json'), recursive=True))

common_files = sorted(ja_files & en_files)

mismatches = []

for f_rel in common_files:
    ja_path = os.path.join(ja_dir, f_rel)
    en_path = os.path.join(en_dir, f_rel)
    
    with open(ja_path, 'r', encoding='utf-8') as f:
        ja_data = json.load(f)
    with open(en_path, 'r', encoding='utf-8') as f:
        en_data = json.load(f)
        
    ja_qs = ja_data.get('questions', [])
    en_qs = en_data.get('questions', [])
    
    ja_by_id = {q.get('id'): q for q in ja_qs}
    en_by_id = {q.get('id'): q for q in en_qs}
    
    # 1. Compare if the question list ordering matches
    ja_ids = [q.get('id') for q in ja_qs]
    en_ids = [q.get('id') for q in en_qs]
    if ja_ids != en_ids:
        mismatches.append({
            'file': f_rel,
            'type': 'ordering',
            'detail': f"JA IDs: {ja_ids}\nEN IDs: {en_ids}"
        })
        
    # 2. Compare matching question IDs
    for qid in sorted(ja_by_id.keys() & en_by_id.keys()):
        jq = ja_by_id[qid]
        eq = en_by_id[qid]
        
        # Compare keys
        jq_keys = set(jq.keys())
        eq_keys = set(eq.keys())
        if jq_keys != eq_keys:
            mismatches.append({
                'file': f_rel,
                'id': qid,
                'type': 'keys_mismatch',
                'detail': f"JA keys: {jq_keys}\nEN keys: {eq_keys}"
            })
            
        # Compare choices length
        jq_choices = jq.get('choices', [])
        eq_choices = eq.get('choices', [])
        if len(jq_choices) != len(eq_choices):
            mismatches.append({
                'file': f_rel,
                'id': qid,
                'type': 'choices_count',
                'detail': f"JA choices: {len(jq_choices)}\nEN choices: {len(eq_choices)}"
            })
            
        # Compare selectCount
        if jq.get('selectCount') != eq.get('selectCount'):
            mismatches.append({
                'file': f_rel,
                'id': qid,
                'type': 'selectCount',
                'detail': f"JA selectCount: {jq.get('selectCount')}\nEN selectCount: {eq.get('selectCount')}"
            })
            
        # Compare answers/correct choices structure
        # Let's find correct choices
        def get_correct_indices(q):
            # In some schemas it might be 'answers' list of indices or 'answer' index
            answers = q.get('answers')
            if answers is not None:
                return sorted(answers)
            answer = q.get('answer')
            if answer is not None:
                return [answer]
            return []
            
        ja_ans = get_correct_indices(jq)
        en_ans = get_correct_indices(eq)
        if ja_ans != en_ans:
            mismatches.append({
                'file': f_rel,
                'id': qid,
                'type': 'answers_mismatch',
                'detail': f"JA answers: {ja_ans}\nEN answers: {en_ans}"
            })

print(f"Total structural/logic mismatches found: {len(mismatches)}")
for m in mismatches:
    print("=" * 60)
    print(f"File: {m['file']}")
    if 'id' in m:
        print(f"Question ID: {m['id']}")
    print(f"Type: {m['type']}")
    print(f"Detail:\n{m['detail']}")
