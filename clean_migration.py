import os
import shutil

print("Starting deep cleanup sequence...")

paths_to_clean = [
    "src/main/resources/db/migration/V2__outbox_and_metadata.sql",
    "src/main/resources/db/migration/V3__add_academic_metadata.sql",
    "target/classes/db/migration/V2__outbox_and_metadata.sql",
    "target/classes/db/migration/V3__add_academic_metadata.sql",
]

for p in paths_to_clean:
    if os.path.exists(p):
        os.remove(p)
        print(f"DELETED: {p}")
    else:
        print(f"Not found: {p}")

print("Cleanup complete.")
