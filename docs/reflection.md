# Individual Reflection — Agence

**Daniel Kalo | CS 7180 | April 2026**

---

Before this project, I thought of AI coding assistants as autocomplete with more context. You describe what you want, the AI writes something plausible, you fix the parts that are wrong. Useful, but not qualitatively different from a fast Stack Overflow.

Agence changed that understanding.

The shift happened during the code review incident. Roughly two weeks into the project, I ran a parallel multi-agent review — four Claude agents (security, architecture, tests, and frontend) analyzing the codebase simultaneously. The architecture agent returned a finding I had not expected: the `marketContextAgent` had been silently returning an empty array in production since it was deployed. The orchestrator was calling it with one argument; the function signature expected two. `marketData` was always `undefined`. The early-exit guard fired on every call. Zero market insights, for weeks, with no error anywhere.

I had read that code dozens of times. I had written the tests for it. The tests passed because they called the agent correctly — with two arguments. The bug lived in the gap between how the function was defined and how the orchestrator called it. That is exactly the kind of cross-file, cross-layer contract violation that is tedious for a human reviewer to catch and trivial for an agent that can trace a full call chain mechanically.

That experience reframed what multi-agent review is actually for. It is not a replacement for human code review. It is a different kind of review — one that excels at mechanical correctness across large surfaces rather than design judgment within a bounded scope.

The hooks system was the other revelation. I configured a PostToolUse hook that runs the test suite after every file edit. This sounds minor. In practice it collapsed the feedback loop so completely that TDD stopped feeling like a discipline and started feeling like the obvious way to write code. Red test, implement, green — all within a single edit cycle, without switching contexts or remembering to run the tests manually. The hook made the right behavior the path of least resistance.

I also learned where Claude Code breaks down. The CORS conflict between CRA's dev proxy and the Express server in my local environment was something Claude could not diagnose or fix — it required me to manually trace the request headers and determine that the environment was interfering with the proxy. All UI verification happened on the Vercel production URL because localhost testing was unreliable. Claude's suggestions here were plausible but consistently wrong, because the problem was in my shell environment rather than the code.

Similarly, the email delivery debugging for the password reset feature took seven attempts. Claude tried SMTP, then SSL variants, then DNS pre-resolution, before landing on the correct answer: Render's free tier blocks all outbound SMTP ports and the only solution is an HTTPS-based email API. A senior developer with Render experience would have known this immediately. Claude reasoned toward it iteratively, which was slower and produced several dead-end commits.

The lesson is precise: Claude Code dramatically accelerates work inside well-understood problem spaces with clear feedback signals (tests pass / fail, lint passes / fails). It struggles with environment-specific constraints and external service behavior that are not visible in the code itself.

What I will carry forward: instrument everything, keep agents pure, and put the feedback signals as close to the edit as possible. The hook system is more valuable than any individual AI suggestion.

---

*Word count: 547*
