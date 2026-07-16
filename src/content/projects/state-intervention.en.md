---
title: Teaching by changing the world, not the reward
excerpt: >-
  How do people teach an agent that cannot be told what to do? We study teaching
  by physical state intervention — rearranging the environment so the learner
  discovers the right behavior.
date: 2026-04-01
locale: en
translationKey: state-intervention
translated: original
tags:
  - pedagogy
  - reinforcement learning
  - social learning
status: active
weight: 20
---

Most work on machine teaching assumes the teacher can shape the learner's
reward, or demonstrate the task directly. But much everyday teaching works
differently: we **change the world** so that the learner's own exploration leads
somewhere useful. You move the obstacle out of the robot vacuum's path; you put
the interesting book on top of the pile.

This project asks how people teach through such physical state interventions,
and what a model-free reinforcement learner should infer when the world keeps
changing around it in suspiciously helpful ways.

## Where the work stands

Three papers appeared at CogSci 2026, led by Zhuolun Zhong:

- [How the Teaching Style and Interpretation Type of State Interventions Shape
  Multi-Agent Coordination](/papers/files/Zhongetal2026CogScia.pdf) — the
  computational side: how a teacher's style and a learner's interpretation
  interact to produce (or destroy) coordination.
- [Individual Differences in Human Teaching of Reinforcement Learning
  Agents](/papers/files/Zhongetal2026CogScib.pdf) — people do not all teach
  alike, and Bayesian hypothesis testing lets us say how they differ.
- [Interpretational alignment: How agents learn from physical guidance depends
  on how they interpret it](/papers/files/Zhongetal2026CogScic.pdf) — a
  simplified grid-world design, with collaborators at Stanford, Princeton, and
  ENS.

A "minimal paradigm" version of the task, developed with students at the COSMOS
summer school, made the design tractable for online experiments; the code is at
[cosmos-state-interventions](https://github.com/benpry/cosmos-state-interventions).

## Background

This line of work grows out of a long collaboration with
[Mark Ho](http://www.markkho.com/) on what teaching *is*, computationally:

- [Teaching with rewards and punishments: Reinforcement or communication?](/en/publications/#ho15)
  (CogSci 2015) and its journal successor,
  [People Teach with Rewards and Punishments as Communication, not
  Reinforcement](/en/publications/#hoetal2019jep) (JEP: General, 2019) — the
  finding that people's rewards are messages, not reinforcement signals.
- [Showing versus doing: Teaching by demonstration](/en/publications/#ho16nips)
  (NIPS 2016) and [Effectively Learning from Pedagogical
  Demonstrations](/en/publications/#hoetal2018) (CogSci 2018) — demonstrations
  chosen to be *informative* differ systematically from demonstrations chosen to
  be *optimal*.
- [Teaching by intervention: Working backwards, undoing mistakes, or correcting
  mistakes?](/en/publications/#ho17) (CogSci 2017) — the most direct ancestor of
  the current work: teaching by acting on the world itself.
- [Communication in Action: Belief-directed Planning and Pragmatic Action
  Interpretation](/en/publications/#ho2021) (JEP: General, 2021).

Interested in the probabilistic machinery behind this work? Our
[narrative introduction to probability](/en/projects/probability-tutorial/)
builds it up from scratch.
