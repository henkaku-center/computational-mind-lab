---
title: Grade it like an audit
excerpt: >-
  A grading tool whose purpose is feedback. It proposes grades, but every point
  deducted has to name an issue and cite a source you can open — and across
  fourteen audit rounds, no finding has ever changed a grade.
date: 2026-08-26
locale: en
translationKey: grade-it-like-an-audit
translated: original
tags:
  - pedagogy
  - ai and education
  - ai ethics
  - methodology
status: active
repo: https://github.com/henkaku-center/grade-it-like-an-audit
weight: 22
---

Grading is where being *almost* right is most expensive and least detectable. A quote that is
close but not verbatim. A number sourced to the wrong table. A compliment that overreaches by
exactly one counterexample. None of these look like errors on the page, all of them reach a
student, and being more careful is not a strategy — you cannot out-attend a failure mode that
is invisible by construction.

This project is what happened when we stopped trying to be more careful and built structure
instead. It is a method you can read, a set of templates you can copy, and an installable
Claude Code plugin that runs the whole workflow.

## What it does with grades, stated precisely

It would be easier to say this tool never touches grades. That would be false, and anyone who
read the source would catch it in a minute. What is true is more useful.

**It is a grading tool whose purpose is feedback.** It drafts evaluations and proposes grades,
but never as a number it simply arrived at. A proposed grade is arithmetic: what remains after
each deduction has named a specific issue and cited a source the instructor can open. Nothing
comes off for a general impression, because a general impression has nothing to cite. Every
finding is a proposal, applied only on approval, and the instructor decides every outcome.

The consequence is a record that happens to be exactly what accountability requires. Guidance
to faculty is consistent that the instructor remains answerable for a grade and must be able to
explain its basis; a run leaves that explanation behind as a by-product rather than as extra
work.

## The loop, and the number that matters

Each round sends one blind auditor per submission — a separate agent with a fresh context
holding only that student's work, so it cannot be contaminated by what it should not see. A
single lead pass then reads across every submission, because fairness is a property of the whole
cohort and no blind reader can see the cohort. Findings and the questions the harness cannot answer go to the human
together, as rulings to be made rather than decisions already taken. Every lesson is written
back into the rulebook, and a round is not closed until it is.

The headline result is the one most tools would bury. Across **fourteen audit rounds and
seventy independent reviews, not one finding has ever changed a grade.** Every catch improved
the evidence or the wording: a misquote, a wrong figure, an unearned compliment. That is the
design rather than a disappointment. The loop protects what the student reads; the outcome is
protected by the instructor's judgment and by the evidence discipline, not by the round count.

## The failures, at the same length as the successes

An account that only describes what a method does well is not much use to someone deciding
whether to rely on it. So here is where this one has failed.

One run went nine rounds and never converged. It was stopped by a diff of what actually ships,
not by a clean pass, because the loop had begun finding defects mostly inside its own repairs —
it had stopped measuring the work's error rate and started measuring its own edit rate. There
is now an explicit rule for detecting that, and it exists because of this.

Worse, and more instructive: after all nine of those rounds, forty-five separate reviews, one
human reading the finished material cold found a defect every one of them had passed. It was a
claim about the world (*"this will serve you well"*), and nothing in any source can falsify a
claim about the future. This is the structural version of the problem and it does not dissolve
with more reviewers: a harness converges on the failure modes it was built to catch and grows
blind to the rest in proportion to how well it works. More agents is not the fix. A person is.

## On privacy, and on what we cannot promise

Submissions can be coded before grading — random per-run codes on the containers, byte-for-byte
copies with hash verification, and the name map kept outside the workspace. The first reason to
do this is blind grading, which is a pedagogical argument that needs no lawyer.

The limits are stated as plainly as the feature. Pseudonymization is not anonymization: you hold
the key because you have to return grades to real people, and under GDPR Recital 26 that keeps
the data personal. Coding the container does not code the content, so a submission that says
"By Jane Doe" inside still does. And one limit deserves naming directly, because it is the one
most likely to matter in a small seminar: the method forbids naming or characterizing another
student in a student's feedback and checks for it mechanically wherever a check is possible, but
a comparative remark can disclose without naming anyone. *"Yours was the only submission that
used X"* tells the reader something about everyone else's work, and there is no token for a
machine to match. We try to avoid these. **We cannot guarantee it**, the risk grows as the class
shrinks, and responsibility for the privacy law and institutional policy of your region rests
with the instructor, not with this tool.

Setup now also asks whether you intend to tell students that an automated pass was involved, and
offers wording to edit. It records the answer and never blocks you.

## Where this goes

The method is not really about grading. It is about how to instruct an agent on any recurring,
high-stakes task where a plausible-but-wrong result is expensive: layered instructions in plain
files, memory that survives the session, and a write-back loop that turns each caught failure
into a rule. Grading was the proving ground because it punishes exactly the errors that are
hardest to see. Templates for code review, compliance audit, and contract review ship alongside
it.

There is a twelve-to-eighteen-minute demo on entirely synthetic data. It plants seven defects
for itself to hunt, and one of the seven is designed so that no source can settle it — the
harness flags it as unverifiable and hands it back, which is the most honest thing a
demonstration can do. Feedback is very welcome, particularly from people who would rather it did
not work.

[Site](https://henkaku-center.github.io/grade-it-like-an-audit/) ·
[What it cannot do](https://henkaku-center.github.io/grade-it-like-an-audit/limits.html) ·
[GitHub](https://github.com/henkaku-center/grade-it-like-an-audit) · CC BY 4.0

Originated by [Ira Winder](https://github.com/irawinder); developed and maintained since by Joe.

Related: [AI in education](/en/projects/ai-education/) is the study this came out of — the same
argument that an honest account of the limits is the interesting part, here with an artifact
attached. The [probability tutorial](/en/projects/probability-tutorial/) is what the same
thinking looks like applied to explanation rather than to evaluation.
