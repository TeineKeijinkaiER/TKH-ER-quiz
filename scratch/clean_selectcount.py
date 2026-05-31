import json
import glob
import os

files_to_modify = {}
total_removed = 0

# 1. Scan and identify changes
for file_path in sorted(glob.glob('data/questions/**/*.json', recursive=True)):
    file_path = file_path.replace('\\', '/')
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        questions = data.get('questions', [])
        changes = []
        for i, q in enumerate(questions):
            if 'selectCount' in q and q['selectCount'] == 0:
                changes.append((i, q['id']))
                
        if changes:
            files_to_modify[file_path] = (data, changes)
            total_removed += len(changes)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

print(f"Found {total_removed} questions with selectCount=0 across {len(files_to_modify)} files.")
for path, (data, changes) in files_to_modify.items():
    print(f"- {path}: {len(changes)} questions to fix (IDs: {[c[1] for c in changes]})")

# 2. Write changes to files
for file_path, (data, changes) in files_to_modify.items():
    for idx, q_id in changes:
        del data['questions'][idx]['selectCount']
    
    # Save the updated file
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n') # Ensure trailing newline
        print(f"Successfully updated {file_path}")
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")

print("All files updated successfully!")
