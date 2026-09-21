# S5 Academic Structure (KTU 2024 CSE)

How Semester 5 is composed in Tarangam, what each component is for, and where deliberately-unimplemented items live as documented structure rather than fabricated notes. Verify credit and scheduling details against the official KTU 2024 scheme; this file describes placement and purpose, not credit counts.

## S5 course map (as implemented)

| Group | Code | Course | Topics | Kind |
|---|---|---|---|---|
| Core Theory | PCCST501 | Computer Networks | 37 | theory notes |
| Core Theory | PCCST502 | Design and Analysis of Algorithms | 31 | theory notes |
| Core Theory | PCCST503 | Machine Learning | 25 | theory notes |
| PBL | PBCST504 | Microcontrollers | 20 | theory + hardware mini-project |
| PE-2 | PECST522 | Artificial Intelligence | 30 | theory notes (implemented elective) |
| Lab | PCCSL507 | Networks Lab | 12 | practical-first experiments |
| Lab | PCCSL508 | Machine Learning Lab | 15 | practical-first experiments |
| MOOC | UCHUM506 | Constitution of India | 4 | external-course guide only |

Total S5: 8 components, 174 topics. Whole repository: 20 courses, 75 modules, 486 topics.

## PE-2 (Programme Elective II)

PECST522 Artificial Intelligence is the currently implemented PE-2 course. The alternatives supported by the KTU scheme are **not** implemented as notes in this phase; they are catalogued here as reserved extension slots so a future task can add any of them without restructuring:

- Slot PE-2-ALT-A: reserved (verify code/title against the official elective list before authoring).
- Slot PE-2-ALT-B: reserved (verify code/title against the official elective list before authoring).
- Slot PE-2-ALT-C: reserved (verify code/title against the official elective list before authoring).

Extension procedure (no architecture change): add `content/<CODE>/` notes with valid front-matter, add the curriculum entry plus `dashboardOrder` position, add assessment questions, regenerate coverage, update baselines. No new content types are needed — electives reuse the theory-note pipeline exactly.

## Industrial Visit / Training

Documented as a curriculum element, not a note series: an external exposure requirement (visits/training with evidence such as reports and certificates, per official notification). Tarangam represents it here so S5 reads complete; there is nothing to teach, quiz, or assess inside the app. Confirm the applicable S5/S6 placement and evidence rules with the departmental circular.

## Remedial / Minor / Honours

Documented as curriculum elements, not note series:

- **Remedial:** backlog/arrear support follows the same theory notes already present (no separate content; weak-topic analysis and revision views already route learners to the exact failed topics).
- **Minor:** additional-course baskets for other branches are outside this CSE implementation; the topic-manifest/assessment pipeline accepts new course codes without modification if ever added.
- **Honours:** advanced extensions build on the same notes plus mini-projects/capstones (PBCST504 hardware project, PCCSL508 capstone); no separate honours syllabus is fabricated here.

## What was deliberately not invented

No four-module technical syllabus for UCHUM506 (guide only); no PE-2 alternative notes (slots only); no credit numbers, timetables, or evaluation weightages (verify against the official scheme); no constitutional teaching content (external MOOC owns it).
