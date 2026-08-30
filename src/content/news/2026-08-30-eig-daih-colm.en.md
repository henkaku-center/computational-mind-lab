---
title: New paper on cost-aware LLM diagnosis at DAIH (COLM 2026)
excerpt: >-
  A hybrid LLM–Bayesian framework for cost-aware sequential diagnosis, with
  collaborators at Gaudiy Inc., was accepted at the Deploying AI in
  Healthcare workshop at COLM 2026.
date: 2026-08-30
locale: en
translationKey: 2026-08-30-eig-daih-colm
translated: original
tags:
  - publications
  - natural language processing
  - bayesian modeling
  - conferences
---

[Adaptive Bayesian Active Querying with LLMs for Efficient Information
Gathering](/papers/files/MalkocetalDAIH2026EIG.pdf) was accepted at
[DAIH: Deploying AI in Healthcare](https://daih2026.github.io/), a workshop
at the [Conference on Language Modeling (COLM) 2026](https://colmweb.org/).

The paper asks a question next door to our [disease progression
work](/en/projects/disease-progression/): rather than reconstructing a
biomarker trajectory after the fact, how should a system decide what to ask
*next*? LLMs can generate plausible diagnostic questions and guess how likely
each answer is, but they don't track calibrated beliefs on their own. We pair
an LLM with a Bayesian decision layer that scores each candidate question (or
costly test) by expected information gain per unit cost, so cheap symptom
questions narrow the hypothesis space before expensive labs get ordered. On
real emergency department cases, the resulting system reached 86.6%
diagnostic accuracy at 31% lower cost than the best non-adaptive baseline.

The project was led by Ognjen ("Ogi") Malkoc and Shubham Saha of [Gaudiy
Inc.](https://gaudiy.com/en/), together with Mizuki Oka of
[JPCCA](https://jpcca.org/) and [Chiba Institute of
Technology](https://chibatech.jp/english/), [Hongtao
Hao](https://hongtaoh.com/) of the University of Wisconsin–Madison, [Grisha
Szep](https://gszep.com/), and our own Joseph Austerweil. Thanks also to
[JPCCA](https://jpcca.org/) for their support of this work, as they have for
our disease progression modeling.

[Code and data are available on GitHub](https://github.com/gaudiy/rnd_bayesian_eig_colm).
