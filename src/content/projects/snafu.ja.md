---
title: SNAFU - The Semantic Network and Fluency Utility
excerpt: 流暢性データから意味ネットワークを生成するためのツールです。
date: '2017-12-08'
locale: ja
translationKey: snafu
translated: auto
tags:
  - python
  - fluency
  - semantic networks
  - memory
status: archived
weight: 200
sourceHash: 7a3bd955615aedeaa2ffb49877a5b12785ce1cef36312c27bac065cf08eb6e68
---

# 概要

意味的流暢性課題（semantic fluency task、カテゴリー内の項目を列挙する課題）は、心理学の分野において研究者・臨床家を問わず頻繁に用いられています。流暢性データの分析は手作業で行われることが多く、時間がかかるうえに誤りが生じやすいという問題があります。SNAFUは、保続（perseveration）の回数、クラスターサイズ、切り替え回数など、よく用いられる多くの指標の計算を自動化します。

近年、多くの研究者が意味的流暢性データを用いて、（動物などの）意味的カテゴリーの表象を推定しています。SNAFUは、流暢性データを用いて意味ネットワーク（semantic network）――カテゴリーメンバーが心の中でどのように組織化されているかを表す表現――を構築するための多くのアルゴリズムを実装しています。

SNAFUは主に、流暢性データを分析し、異なる集団や個人間の意味ネットワークを比較したいと考える研究心理学者を対象としています。

# 使い方

SNAFUにはいくつかの形態があります。最大限に活用するには、以下からPythonライブラリとしてSNAFUを利用することをご検討ください。

[https://github.com/AusterweilLab/snafu-py](https://github.com/AusterweilLab/snafu-py)

または、gitから直接インストールすることもできます（補助ファイルは含まれません）。

`pip install git+https://github.com/AusterweilLab/snafu-py`


Githubリポジトリにはいくつかのデモファイルが含まれています。チュートリアルは[Zemla, Cao, Mueller, & Austerweil
(2020)](/papers/files/Zemla2020.pdf)からも入手できます。

グラフィカルなフロントエンドも用意されていますが、Pythonライブラリほど多くの機能は含まれていません。macOS版・Windows版は以下から入手できます。

[SNAFU 2.4.1 for Windows](https://github.com/AusterweilLab/snafu-py/releases)

[SNAFU 2.4.1 for macOS](https://github.com/AusterweilLab/snafu-py/releases)

Windows版をインストールするには、上記のファイルをダウンロードして解凍するだけです。macOS版をインストールするには、上記のdmgファイルをダウンロードし、snafu.appをコンピュータ（デスクトップやApplicationsフォルダなど）にドラッグしてください。
