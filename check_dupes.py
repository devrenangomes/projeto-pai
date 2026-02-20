import csv

file_path = '/Users/renangomes/projetoPai/namelist.csv'

id_counts = {}
rows_by_id = {}

with open(file_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    next(reader) # header
    for row in reader:
        try:
            # Clean ID
            id_val = int(row[0])
            id_counts[id_val] = id_counts.get(id_val, 0) + 1
            if id_val not in rows_by_id:
                rows_by_id[id_val] = []
            rows_by_id[id_val].append(row)
        except ValueError:
            pass

# Check ID 1 specifically
print(f"ID 1 count: {id_counts.get(1, 0)}")
if 1 in rows_by_id:
    for r in rows_by_id[1]:
        print(f"ID 1 entry: {r}")

# Check for any other high duplication (e.g. 3x)
high_dupes = {k: v for k, v in id_counts.items() if v > 1}
if not high_dupes:
    print("No duplicates found.")
else:
    print(f"Found {len(high_dupes)} duplicated IDs.")
    for k in sorted(high_dupes.keys())[:5]:
        print(f"ID {k}: {high_dupes[k]} times")
