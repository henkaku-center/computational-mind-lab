---
title: Modeling how diseases progress
excerpt: >-
  Probabilistic and transformer-based models that recover the order in which a
  chronic disease changes the brain and behavior — learned from data collected
  at a single point in time. Led by Hongtao Hao.
date: 2026-04-01
locale: en
translationKey: disease-progression
translated: original
tags:
  - disease progression
  - bayesian modeling
  - computational psychiatry
status: active
repo: https://github.com/jpcca
weight: 10
---

Chronic diseases such as Alzheimer's unfold over decades, but the data we can
collect is usually **cross-sectional**: one measurement per person, at whatever
stage they happen to be in. Event-based models turn that limitation into a
question of inference — if each patient is a snapshot from a shared underlying
trajectory, we can reconstruct the trajectory from the snapshots.

This line of work is led by **[Hongtao Hao](https://hongtaoh.com/)**, who built
it through his PhD and continues it now. Every model below ships as an installable
package, because a method nobody can run is not a method.

## The models

**Stage-aware modeling (SA-EBM).** Standard event-based models treat every
biomarker as either "affected" or "not affected." We formulate the intuition that
a disease increasingly impacts more cognitive and biological factors as it
progresses, and show that modeling stage directly improves recovery of the
progression sequence.
[Paper](/papers/files/Haoetal2025SAEBM.pdf) ·
[GitHub](https://github.com/jpcca/pysaebm) ·
[`pip install pysaebm`](https://pypi.org/project/pysaebm/)

**Subtypes (Bayesian EBM).** Diseases do not progress the same way in every
patient, but neither do they vary arbitrarily — there are typically a few
recurring subtypes. We infer subtype and stage jointly.
[Paper](/papers/files/HaoAusterweil2025BEBMS.pdf) ·
[GitHub](https://github.com/jpcca/bebms_pkg) ·
[`pip install bebms`](https://pypi.org/project/bebms/)

**Mixed pathology (JPM).** Most event-based models assume one disease per person.
In reality, several pathologies often progress at once, so we model them jointly
rather than forcing a single explanation.
[Paper](/papers/files/Hao2025JPM.pdf) ·
[GitHub](https://github.com/jpcca/pyjpm) ·
[`pip install pyjpm`](https://pypi.org/project/pyjpm/)

**Learned inference (TEMPO).** A transformer trained on data simulated from the
probabilistic model performs inference faster and more accurately than our
original method — while the probabilistic model remains essential, both as the
source of the training data and as the thing that makes the result
interpretable.
[Paper (CHIL 2026)](/papers/files/HaoetalCHIL2026TEMPO.pdf) ·
[GitHub](https://github.com/jpcca/tempo)

## Collaboration

The work is joint with collaborators in neurology and neuroimaging, and is
developed in the open — code and data live on the
[JPCCA GitHub organization](https://github.com/jpcca). Recent results were
presented at [ML4H and the NeurIPS Time Series for Health
workshop](/en/news/2025-12-05-ml4h-neurips/), and TEMPO appeared at
[CHIL 2026](/en/news/2026-06-25-chil-tempo/).
