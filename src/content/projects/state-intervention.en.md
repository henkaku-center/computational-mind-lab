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

We approach it from both sides:

- **Behavioral experiments.** People teach a simulated agent in a grid world by
  intervening on its environment. We look at what interventions they choose and
  how those choices depend on what they believe the learner can learn. A
  simplified "minimal paradigm" version of the task, developed with students at
  the COSMOS summer school, makes the design tractable for online experiments.
- **Multi-agent simulation.** We model the teacher–learner pair computationally
  to ask when state intervention is an efficient teaching channel, and what
  goes wrong when the learner does not know it is being taught.

Code for the minimal-paradigm study is available at
[cosmos-state-interventions](https://github.com/benpry/cosmos-state-interventions).
