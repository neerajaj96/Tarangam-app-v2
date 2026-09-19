# Linux Attacks, Physical & Config Security

**Penguin threat surface — privilege paths, evil-maid physicals, and configuration as code hogs.**

<a id="the-intuition"></a>
## 1. The Intuition

::: callout-intuition Core Mental Model: Monastery Rules
Monks (users) own cells (home dirs, `0700`), abbots (root) only via the *sudo* grille (logged, time-boxed tickets — never shared passwords!). **Physical access** is the skeleton key (evil-maid boot-USB resets passwords in minutes — encryption *at rest* + Secure Boot + BIOS locks answer). **Configuration** drift (stale services, world-writable cron, `NOPASSWD` confetti) rots silently — baselines + audits (Lynis-class checklists, config management: declared state, converged hourly) keep vows.
:::

---

<a id="the-math"></a>
## 2. Theoretical Framework & Formalism

### 2.1 Attack paths + physical/config locks

* Paths: SSH password-spray/brute (keys-only cures), outdated daemons (RCE→shell), web-shell uploads, cron abuse, SUID binaries (`find -perm -4000` audits!), kernel EoP, container escapes (privileged flags!), supply-chain (PPA/curl-pipe-sh).
* Physical: disk encryption (LUKS: data-at-rest safe from boot-USB), Secure Boot chain, BIOS/GRUB passwords, USB-port policy, screen lock.
* Config: minimal installs, disable unneeded services/sockets, sysctl hardening (`kptr_restrict`, `dmesg_restrict`, ASLR full), SSH (`PasswordAuthentication no`, fail2ban), backups + tested restores.

::: callout-formula KTU Formula Vault: Linux Locks
Sudo **logged tickets** · at-rest **encrypted** · config **declared+converged** · SSH **keys-only**.
:::

::: callout-pitfall `chmod 777` as "Fix" Is Surrender
Permission-denied → world-writable "fixes" the symptom by deleting the control (any local user/process now writes executes!). Diagnose ownership/groups/ACLs (`namei -l` walks the path!) — precision over sledgehammer, always.
:::

---

<a id="worked-example"></a>
## 3. Worked Example / Step-by-Step Scenario

::: step [Step 1: Setup] Formulating the Problem
"Lab server SSH hammered ($10$k tries/hour, password auth on, root login yes). Harden in order + verify each, then state the physical twin-controls for the same box."
:::

::: step [Step 2: Execution] Requests Per Second to Silence
1. Keys-only (`PasswordAuthentication no`), root login `prohibit-password`→`no`, fail2ban jail (verify: `journalctl` bans landing; test login with key ✓, password ✗).
2. Nonstandard-port? No — obscurity noted as *supplement* (log-noise down, security same) — honesty over myth.
3. Physical twin: LUKS-encrypted data volume (stolen disk = brick), GRUB password + boot-order lock (USB bypass dead), rack lock + camera log.
:::

::: step [Step 3: Conclusion] Final Result
Auth-kill (keys), noise-cut (fail2ban, obscurity labelled), at-rest brick (LUKS), boot-chain locks. Each control names its defeated vector — vector-mapped hardening, no salad.
:::

::: anim maid-ladder Each Rung Answers the Last Bypass
Watch each bypass meet its rung — USB meets LUKS, bootkit meets Secure Boot plus TPM — the ladder reasoning the file demands, never one wall.
:::

---

<a id="self-check"></a>
## 4. Active Recall Quizzes

::: quiz Q1: Foundational Concept
SUID binaries are privilege landmines because:
(A) They're large files
(*B) They execute as *owner* (often root) whoever runs them — a bug inside runs attacker input at owner privilege (classic EoP: `find / -perm -4000` inventories the minefield; least-necessity + capabilities (`setcap`) shrink it)
(C) They bypass firewalls
(D) They log everything
::: explanation
Owner-execution inverts the caller privilege (protection boundary crossed *by design* for narrow jobs like `passwd`). Inventory-then-minimise (drop SUID, use capabilities/sudo-rules) is the audit motion — list, justify, shrink.
:::

::: quiz Q2: Foundational Concept
Evil-maid vs disk encryption outcome:
(A) Maid always wins
(*B) Unencrypted: boot-USB → password reset/implant in minutes (physical = root, game over). LUKS: ciphertext brick without passphrase (evil-maid *reinstalls* bootloader instead — Secure Boot + TPM-sealed keys answer *that* rung). Ladder, not wall.
(C) Encryption slows CPUs fatally
(D) BIOS passwords suffice alone (resettable via CMOS — single-pin lies!)
::: explanation
Each rung answers the last bypass (USB→encryption→bootkit→SecureBoot/TPM→soldering-adversary…). Rung-ladder reasoning (what defeats what next) is the physical-security answer shape — never one-wall claims.
:::

::: quiz Q3: Foundational Concept
Configuration management (Ansible-style declared state) secures by:
(A) Faster typing
(*B) Drift death: hourly convergence reverts snowflakes (rogue cron/backdoor user auto-removed), changes peer-reviewed as code (audit trail!), baselines versioned — posture as *code*, not memory
(C) Bigger disks
(D) GUI dashboards
::: explanation
Unmanaged boxes snowflake (hand-edits accumulate, nobody knows true state); managed boxes converge (declared ⇒ enforced ⇒ audited). Drift-is-the-vulnerability thesis — convergence cadence is the control metric.
:::
