# Linux Auth, Patches & SELinux

**Who-are-you plumbing — passwd/shadow, sudoers precision, update doctrine — plus MAC confinement with SELinux.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Abbey Credentials Office
**passwd** lists monks (world-readable roster), **shadow** hides password hashes (root-eyes-only vault — the split *is* the fix for old readable hashes!). **sudoers** writes hall passes (who→which commands→which hosts, `NOPASSWD` sparingly as fire-exit-only!). **Patches**: unattended-upgrades for the monastery's published errata (CVE masses celebrated monthly, zeros rushed). **SELinux**: even abbots wear vests — *mandatory* policies confine processes to need-to-reach (type enforcement: httpd reads web content, not `/etc/shadow`, *even as root* — breach blast shrink-wrapped).
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Auth plumbing + SELinux model

* passwd/shadow split, hashing (yescrypt/bcrypt + salts — no plaintext/MD5!), SSH keys + `authorized_keys` hygiene, sudoers least-command (Cmnd_Alias scoping, `requiretty`/logging on).
* Upgrades: staged rings, auto-security-updates, reboot discipline (livepatch where uptime-crowned), EOL tracking (unpatched = accepted-risk memo!).
* SELinux: enforcing/permissive/disabled (permissive logs-learns, never ship disabled-silently!); types/contexts (`ls -Z`), booleans (feature toggles), audit2allow custom policy from denials (logged, reviewed, compiled — never blind `audit2allow -M` pipes without reading!).

::: callout-formula KTU Formula Vault: Linux Auth+MAC
Roster **public**, hashes **vaulted** · passes **least-command** · patches **ringed+auto** · SELinux: **types confine, even root**.
:::

::: callout-pitfall `setenforce 0` Forever Is Surrender (Again)
First-denial reflex (disable SELinux!) trades the MAC vest for quiet logs — permissive-then-policy (audit2allow *reviewed*) keeps both peace and protection. Denial-driven policy crafting is the discipline; disable is the debt.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Web VM: deploy user needs restarts-only, auditors need read-only logs, patches auto. Write sudoers lines + SELinux posture + patch proof artifacts."
:::

::: step [Step 2: Execution] Least-Command Paperwork
1. `deploy ALL=(root) /bin/systemctl restart webapp` (no `ALL`, no NOPASSWD — password re-asks contain stolen sessions!). `auditors ALL=(root) /usr/bin/journalctl, /usr/bin/less /var/log/*` (read-only paths enumerated).
2. SELinux enforcing; httpd context verified (`ls -Z` shows `httpd_sys_content_t` on docroot — custom path? `semanage fcontext` + `restorecon`, not `chcon`-temporary!).
3. Proof: unattended-upgrades logs + reboot records + quarterly `lynis`-style audit deltas (artifacts, not assertions).
:::

::: step [Step 3: Conclusion] Final Result
Command-scoped passes, context-correct files, log-backed patch proof. Paperwork-precision (enumerated commands, typed files, dated logs) is the Linux-admin answer texture.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
passwd/shadow split exists because:
(A) Tradition
(*B) Old single-file hashes were world-readable (crack-at-leisure offline!) — split keeps names public (many tools need UID mapping) while hashes hide root-only (offline cracking needs root first now)
(C) Disks were small
(D) Speed
::: explanation
Read-needs differ (world needs names, nobody needs hashes but verifiers) — split serves both. History (pre-shadow `/etc/passwd` hash harvesting) justifies the anatomy — cite the failure it buries.
:::

::: quiz Q2: Foundational Concept
SELinux stops a *root* web exploit from reading `/etc/shadow` by:
(A) Hiding the file path
(*B) Type enforcement: httpd processes carry a domain allowed only web-content types — root *identity* doesn't override *type* policy (MAC over DAC: policy beats ownership, even root's!)
(C) Encrypting shadow
(D) Killing the process first
::: explanation
DAC (owner/root powers) yields to MAC (system policy) — compromise of *user* (even root-user!) ≠ compromise of *domain*. Type boundaries contain breaches laterally — the MAC moral in one file.
:::

::: quiz Q3: Foundational Concept
`NOPASSWD: ALL` for developers "for velocity" is:
(A) Industry standard
(*B) Passwordless-root for any compromised dev session/process (malware inherits sudo-silence!) — scope to commands + keep passwords (or short timeouts), velocity via narrowly-scoped rules reviewed quarterly
(C) Required for CI only (CI uses scoped service accounts + short creds — different pattern!)
(D) Harmless with MFA (helps login, not post-login abuse!)
::: explanation
Session-compromise blast radius is the metric: passworded sudo bounds it per-command-window; NOPASSWD:ALL unbounds it totally. Convenience-vs-blast scoping per rule — velocity with blast math attached.
:::
