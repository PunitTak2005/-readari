# Security Specification: Book Tracker

## 1. Data Invariants

- **User Ownership**: A user can only read, create, update, or delete their own user profile and books. There are no shared books or public books in this application. All data resides strictly under `/users/{userId}`.
- **Strict Timestamps**: Creation timestamps (`createdAt`) must match the server's execution request time and are immutable post-creation. Update timestamps (`updatedAt`) must always match `request.time`.
- **Field Restraints**: 
  - `status` can only be `'want-to-read'`, `'reading'`, or `'completed'`.
  - `rating` must be an integer between 0 and 5.
  - Page tracking: `currentPage` and `totalPages` must be non-negative integers, and `currentPage` cannot exceed `totalPages` (with extra tolerance if reading from cover-to-cover or total pages is unknown, but standard validation blocks invalid ranges).
  - String inputs (`title`, `author`, `review`, `notes`) must be capped in size (300 chars for metadata, 10000 chars for long form texts like notes and reviews) to avoid Denial of Wallet resource attacks.

---

## 2. The "Dirty Dozen" Payloads (Exploit Vector Attacks)

Every write vector listed below must receive a `PERMISSION_DENIED` status:

### Identity & Spoofing Attacks
1. **The Identity Hijack**: Writing a book into another user's collection `/users/hackerUser/books/book123` with a legitimate authenticated session as `victimUser`.
2. **The Owner Spoof**: Authenticated `victimUser` attempts to modify `/users/victimUser/books/book123` but updates the owner id to another user to orphan the write.

### Schema & Integrity Attacks
3. **The Ghost field injection**: Writing a book item with an unrequested field `isAdminAllowed: true` or `shadowField: "exploit"` to test schema gaps.
4. **The Value Poisoning**: Updating the book rating to `99` out of `5` or `-1` to trigger visual or mathematical buffer issues.
5. **The Type Poisoning**: Creating a book where the `currentPage` is a boolean `true` or a nested map, instead of an integer.
6. **The Status Exploit**: Bypassing allowed values for `status` with a raw string `'none-of-your-business'`.

### Path & Boundary Attacks
7. **The ID Poisoning Injection**: Attempting to create a book with an ID variable that contains junk/malicious path symbols or exceeds 128 characters: `/users/victimUser/books/some_malicious_path_%%%%_$$$`.
8. **The Payload Flooding**: Attempting to insert a book review or notes containing 10MB of text to deplete resources (the "Denial of Wallet" attack).

### Temporal & State Lifecycle Attacks
9. **The Retroactive Timestamp Hack**: Setting a book's `createdAt` timestamp in the past or the future, rather than using server's `request.time`.
10. **The Immortal Field Update**: Changing the `createdAt` value of an existing book during a standard update.
11. **The Inconsistent State short-cut**: Updating `updatedAt` to a static outdated date or omitting it, bypassing tracking.
12. **The Empty Book Attack**: Creating a book with null or blank names (`title` = `""` or `author` = `""`).

---

## 3. Test Cases Spec

Our `firestore.rules` must protect against these vectors absolutely.
We will draft and finalize the security rules directly in `/firestore.rules`.
