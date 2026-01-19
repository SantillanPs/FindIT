from database import SessionLocal, FoundItem, LostItem, Claim, ItemStatus, ClaimStatus
db = SessionLocal()

total_lost = db.query(LostItem).filter(LostItem.status == ItemStatus.REPORTED.value).count()
total_found = db.query(FoundItem).filter(
    FoundItem.status.in_([ItemStatus.REPORTED.value, ItemStatus.IN_CUSTODY.value])
).count()
total_claims = db.query(Claim).filter(Claim.status == ClaimStatus.PENDING.value).count()

all_found = db.query(FoundItem).all()

print(f"Stats check:")
print(f"  Lost: {total_lost}")
print(f"  Found (active): {total_found}")
print(f"  Claims (pending): {total_claims}")
print(f"Total Found items (all): {len(all_found)}")

db.close()
