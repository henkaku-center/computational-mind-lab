---
title: Jarjar Slack 通知ツール
excerpt: Jeff（ジェフ）と Nolan（ノーラン）が、Slack に通知を送信するための bash および Python モジュールを開発しました。
date: '2017-06-28'
locale: ja
translationKey: jarjar-slack
translated: auto
tags:
  - slack
  - jarjar
status: archived
weight: 200
sourceHash: 2c31871c183c11ecba1eba767f84f1146df7bc2d36394459a7a75ac1c492afc9
---

Jarjar は、Slack チームへプログラムから通知を送信できるスクリプト集です。

**コードは [Github](https://github.com/AusterweilLab/jarjar) で公開されています。**

## jarjar でできること

_私たち_が実際に利用している例をいくつか挙げます。

- 自分やグループへリマインダーを送信
- ジョブ（シミュレーション、バックアップなど）が完了した際にユーザーへ通知
- jarjar と cron を組み合わせて、[毎日前向きなメッセージ](http://i.imgur.com/YkqMwCx.png)を送信


## どうやって？

jarjar には、シェルコマンドと Python モジュールという2つのインターフェースが用意されています。

# シェルコマンド

[`sh/`](https://github.com/AusterweilLab/jarjar/tree/master/sh) ディレクトリには、シェルコマンド [`jarjar`](https://github.com/AusterweilLab/jarjar/blob/master/sh/jarjar) と設定ファイル [`.jarjar`](https://github.com/AusterweilLab/jarjar/blob/master/sh/.jarjar) が含まれています。

設定ファイルには、よく使うデフォルト値を記入しておきます。特に重要なのは、jarjar がメッセージの送信先を把握できるよう、Slack の webhook を貼り付けておくことです。設定ファイルはホームディレクトリ（`~/`）に置いてください。jarjar はそこを参照します。心配はいりません。これらのデフォルト値は後から上書きできます。

さらに、シェルコマンドを[パスに追加](https://stackoverflow.com/questions/20054538/add-a-bash-script-to-path)します。これで、以下のように使用できます。

```sh
# echo the default message to the default channel
jarjar -e

# echo a message to the #general channel
jarjar -e -u #general -m "Hi, everyone!!"

# Send yourself a notification when a script is completed
jarjar -u @username -m "Your job is finished!" python my-script.py

# send a message to the non-default slack team
jarjar -e -u @username -m "Hi!" -w "their-webhook-url"
```

## オプション

{:.datatable}
| オプション | 説明 | 
|   ---    |     ---     |
|   `-e`   | メッセージをエコー出力します。このフラグを指定しない場合、jarjar は指定されたプロセスが完了するまで待ってからメッセージを送信します。デフォルト（`-e` フラグなし）では、jarjar はスクリプトを screen 上で起動します（スクリプトの終了とともに screen も終了します）。jarjar が起動した screen は、適切な PID を見つければいつでも再開できます。`screen -ls` と `screen -r PID` を使用してください。 |
|   `-r`   | jarjar が作成した screen にアタッチします（`-e` を使用しない場合） |
|   `-m`   | 送信するメッセージ |
|   `-u`   | ユーザー名（またはチャンネル）。ユーザー名は `@`、チャンネルは `#` で始める必要があります。 |
|   `-w`   | Slack チームの webhook。 |

# Python モジュール

このモジュールは、jarjar の機能を Python スクリプト内でより柔軟に実装します。jarjar モジュールをインポートすると、デフォルトの webhook とチャンネル（これらは上書き可能です）で初期化されたシンプルなクラスを利用でき、シェルコマンドと同様にメッセージを送信できます。

インストールは簡単です。

1. [`python/jarjar`](https://github.com/AusterweilLab/jarjar/tree/master/python) フォルダがパス上にあることを確認してください（例えば、作業ディレクトリやモジュールディレクトリにコピーします）。 
2. [`python-requests`](http://docs.python-requests.org/en/master/) をインストール済みであることを確認してください。

これで準備完了です！以下のように使用できます。

```python
from jarjar import jarjar

# initialize with defaults
jj = jarjar(channel = '#channel', url = 'slack-webhook-url') 

# send a text message
jj.text('Hi!') 

# send an attachment
jj.attach(dict(status='it\'s all good')) 

# send both
jj.post(text='Hi', attach=dict(status='it\'s all good'))

# override defaults
jj.attach(dict(status='it\'s all good'), channel = '@jeffzemla')
jj.text('Hi!', channel = '@nolan', url = 'another-webhook')

# initialization is not picky
jj = jarjar()
jj.text('Hi', channel = '#channel', url = 'slack-webhook-url') 

jj = jarjar(url = 'slack-webhook-url')
jj.attach(dict(status='it\'s all good'), channel = '#channel') 
```

## メソッド

### text

> `jj.text(text, **kwargs)`

文字列 `text` で指定したテキストメッセージを送信します。`kwargs` でチャンネルと webhook の URL を任意に指定できます。

### attach

> `jj.attach(attach, **kwargs)`

dict `attach` の値で指定した添付ファイルを送信します。`kwargs` でチャンネルと webhook の URL を任意に指定できます。

### post

> `jj.post(text=None, attach=None, channel=None, url=None)`

汎用的な post メソッドです。`jj.text(...)` と `jj.attach(...)` は、このメソッドをラップした単なる便利関数です。テキストや添付ファイルを指定でき、デフォルトのチャンネルと webhook の URL を上書きすることもできます。

# Slack Webhook の設定方法

Slack チームで [Incoming Webhooks](https://api.slack.com/incoming-webhooks) を設定する必要があります。デフォルトのチャンネル（jarjar 側で上書き可能です）を指定すると、Slack が webhook の URL を発行してくれます。それだけです！ 

設定時には、カスタムの名前とアイコンも指定できます。私たちは webhook ロボットに `jar-jar` という名前を付け、[このアイコン](http://i.imgur.com/hTHrg6i.png)を使用しました。そのため、メッセージは次のように表示されます。

![](http://i.imgur.com/g9RG16j.png)
