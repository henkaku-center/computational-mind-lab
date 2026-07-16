---
title: Modeling how diseases progress
excerpt: >-
  Probabilistic and transformer-based models that recover the order in which a
  chronic disease changes the brain and behavior — learned from data collected
  at a single point in time.
date: 2026-04-01
locale: en
translationKey: disease-progression
translated: original
tags:
  - disease progression
  - bayesian modeling
  - computational psychiatry
status: active
weight: 10
---

Chronic diseases such as Alzheimer's unfold over decades, but the data we can
collect is usually **cross-sectional**: one measurement per person, at whatever
stage they happen to be in. Event-based models turn that limitation into a
question of inference — if each patient is a snapshot from a shared underlying
trajectory, we can reconstruct the trajectory from the snapshots.

We work on making these models both more realistic and more useful to
clinicians:

- **Stage-aware modeling (SA-EBM).** Standard event-based models treat every
  biomarker as either "affected" or "not affected." We formulate the intuition
  that a disease increasingly impacts more cognitive and biological factors as
  it progresses, and show that modeling stage directly improves recovery of the
  progression sequence.
- **Subtypes (Bayesian EBM).** Diseases do not progress the same way in every
  patient, but neither do they vary arbitrarily — there are typically a few
  recurring subtypes. We infer subtype and stage jointly.
- **Mixed pathology (JPM).** Most event-based models assume one disease per
  person. In reality, several pathologies often progress at once, so we model
  them jointly rather than forcing a single explanation.
- **Learned inference (TEMPO).** A transformer trained on data simulated from
  the probabilistic model performs inference faster and more accurately than
  our original inference method — while the probabilistic model remains
  essential, as the source of the training data and of the model's
  interpretability.

The work is joint with collaborators in neurology and neuroimaging, and is
developed in the open.
