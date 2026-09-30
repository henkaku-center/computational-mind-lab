---
title: New Paper on Cost-Aware LLM Diagnosis Accepted at DAIH (COLM 2026)
excerpt: >-
  A collaboration with Gaudiy Inc. on a hybrid framework combining LLMs and
  Bayesian inference for cost-aware sequential diagnosis has been accepted at
  the Deploying AI in Healthcare workshop at COLM 2026.
date: 2026-08-30T00:00:00.000Z
locale: en
translationKey: 2026-08-30-eig-daih-colm
translated: auto
tags:
  - publications
  - natural language processing
  - bayesian modeling
  - conferences
sourceHash: cd976ed80d0368c732a3f8683f919d8616f58635d7be7a411bf7958fa680ec5d
---

[Adaptive Bayesian Active Querying with LLMs for Efficient Information
Gathering](/papers/files/MalkocetalDAIH2026EIG.pdf) has been accepted at [DAIH: Deploying AI in Healthcare](https://daih2026.github.io/), a workshop of the [Conference on Language Modeling (COLM) 2026](https://colmweb.org/).

This paper addresses a question adjacent to our [research on disease progression modeling](/en/projects/disease-progression/). Rather than reconstructing biomarker trajectories after the fact, how should a system decide *what* to ask next? An LLM can generate plausible diagnostic questions and estimate how likely each answer is, but it cannot track calibrated beliefs on its own. We pair the LLM with a Bayesian decision layer that scores each candidate question (or costly test) by its expected information gain per unit cost. This allows the system to narrow the hypothesis space with inexpensive symptom questions before ordering costly tests. On real emergency department cases, the system achieved 86.6% diagnostic accuracy at 31% lower cost than the best non-adaptive baseline.

The project was led by Ognjen Malkoc (nicknamed "Ogi") and Shubham Saha of [Gaudiy Inc.](https://gaudiy.com/en/), with contributions from Mizuki Oka of [JPCCA](https://jpcca.org/) and [Chiba Institute of Technology](https://chibatech.jp/english/), [Hongtao Hao](https://hongtaoh.com/) and [Grisha Szep](https://gszep.com/) of the University of Wisconsin–Madison, and Joseph Austerweil of our lab. As with our disease progression modeling work, we are grateful to [JPCCA](https://jpcca.org/) for supporting this research.

[The code and data are available on GitHub](https://github.com/gaudiy/rnd_bayesian_eig_colm).
