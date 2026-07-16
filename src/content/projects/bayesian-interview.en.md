---
title: Asking better questions
excerpt: >-
  Combining probabilistic programming with large language models to plan
  sequences of natural-language questions that gain the most information per
  question asked — and per unit of cost.
date: 2026-04-01
locale: en
translationKey: bayesian-interview
translated: original
tags:
  - natural language processing
  - bayesian modeling
  - planning
status: active
weight: 30
---

Some of the most valuable interviews are adaptive: a good diagnostician, or a
good twenty-questions player, chooses each question based on what the previous
answers ruled out. Framed formally, this is **Bayesian optimal experiment
design** — select the question that maximizes expected information gain about
the thing you are trying to learn.

Doing this in natural language runs into two problems. Large language models
asked to update their beliefs in context do so inconsistently, and planning
ahead over question sequences requires many model queries, which is expensive.

Our approach places the language model *inside* a probabilistic program, so
that belief updating happens where it can be done properly, while the language
model supplies the implicit knowledge and the natural-language questions. We
use amortized inference and caching to make planning affordable.

Two findings shape the current work. First, greedy question selection is
already near-optimal for something like twenty questions when questions are
free — so we add **question costs**, which both makes planning matter and
connects the setup to medical diagnosis, where tests differ enormously in
burden and expense. Second, adaptive expected information gain addresses a
failure mode where the baseline model stalls by generating a series of
redundant questions.

This is a collaboration with [Gaudiy](https://gaudiy.com/).
