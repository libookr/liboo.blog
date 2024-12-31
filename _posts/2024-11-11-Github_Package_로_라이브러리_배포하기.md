---
layout: post
current: post
cover: "upload/2024-11-11-Github_Package_로_라이브러리_배포하기.md/0.png"
navigation: True
title: "Github Package 로 라이브러리 배포하기"
date: 2024-11-11 02:30:00
tags:
    - [github-package, yarn, ]
class: post-template
subclass: 'post'
author: 
  - "hoeeeeeh"
categories:
    - [학습, ]
---

프로젝트를 진행하면서 `node-media-server` 라이브러리를 사용하기로 결정해서 소스 코드를 천천히 뜯어보니 우리 서비스에 맞게끔 코드를 조금 수정할 필요가 있었다.


처음에는 node-media-server 소스 코드를 전부 들고와서 liboo 레포지토리에 그대로 넣은 후 코드를 수정했었는데, 경우에 따라서 누군가 코드를 읽다가 ‘이 파일들은 뭐지?’ 같은 의구심을 품을 수 있을 것 같았다.


따라서 서비스에 맞게 수정한 node-media-server 를 분리하면서 다른 라이브러리를 사용하는 것 처럼 import 할 수 있도록 Github Package 를 활용해보려고 한다.


## Github Package , npm


Github Package 와 npm 은 모두 패키지 저장소의 역할을 하지만 npm 은 private 이 유료, Github Package 는 무료라는 차이가 있다. 또한 Github Package 는 Github 의 기능이기 때문에 다른 기능, 예를 들어 Github Action 같은 기능과의 연동이 쉽다. 


liboo 의 node-media-server 라이브러리는 private 이든, public 이든 큰 상관은 없지만 추후에 Github Action 을 활용해서 배포하는 것이 편할 것 같다는 생각에 Github Package 를 선택했다.


## Github Package publish


### Fork 


![0](/upload/2024-11-11-Github_Package_로_라이브러리_배포하기.md/0.png)_image.png_


일단 사용하고자 하는 라이브러리인 Node-Media-Server 를 fork 해왔다.


MIT 라이센스는 수정, 배포, 복제 등을 자유롭게 허용하는 관대한 라이센스라서 마음대로 fork 해와서 사용해도 괜찮지만 원저작자의 고지는 해야한다.


### Package.json



```
json
  "name": "@hoeeeeeh/node-media-server",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/"
  },
  "version": "2.7.27",
  "description": "A Node.js implementation of RTMP Server for naver boostcamp project : liboo",
  "bin": "bin/app.js",
  "main": "src/node_media_server.js",
  "types": "src/node_media_server.d.ts",

```


- name: `@hoeeeeeh` 처럼 앞에 자신의 Github ID 로 구분자를 주면 된다.
- publishConfig: npm 이 아닌 Github Package 로 지정해야하기 때문에 `"registry": "https://npm.pkg.github.com/"` 로 지정한다.
- version: 버전은 아무렇게나 지정해도 되는데, 만약 2.7.27 로 배포한 후에 수정 후 다시 배포한다면 2.7.27 이 아닌 다른 버전이어야 한다.
- `main, types` : 기존의 node-media-server 는 js 로 작성된 라이브러리이다. 그러나 liboo 의 서버는 ts 로 작성할 예정이기 때문에 자바스크립트로 작성한 것들의 `타입` 에 대한 선언이 필요하다.

	보통은 `@types/{package_name}`  으로 타입을 내려받을 수 있겠지만 Github Package 에는 npm 의 @types 같은 네임스페이스가 없다.


	그래서 우리는 package.json 에 “types” 를 만들고, 타입에 대한 선언을 담고 있는 d.ts 파일을 지정해줘야한다.


	다행히도 node-media-server 는 이미 @types 에 선언되어있던 것이 있다. 그래서 그 파일을 들고와서 liboo 에 맞게끔 조금 수정한 뒤에, types: ….d.ts 로 걸어주면 된다.


	타입스크립트는 이름이 같은 js 와 d.ts 인 경우에는 자동으로 타입으로 생각해서 읽는다.


### Publish



```
json
// 프로젝트 root 에 .npmrc 혹은 .yarnrc.yml
npmScopes:
  hoeeeeeh:
    npmRegistries:
      "https://npm.pkg.github.com/":

```



스코프별로 레지스트리를 다르게 지정해줄 수 있다.


우리는 @hoeeeeeh/node-media-server 를 배포하는 것이기 때문에, hoeeeeeh 의 레지스트리를 Github Package 로 지정해준 것이다.


만약 스코프를 지정하지않고 npm 레지스트리를 Github Package 로 바꿔버리면 평범한 라이브러리를 설치하려고 해도 github package 로 접근해서 찾기 때문에 문제가 발생한다. 


이후에 `npm publish` 혹은 `yarn publish` 를 통해 배포해주면 된다.


### Install


Github Package 는 npm 과는 다르게 인증 절차가 있어야만 install 을 할 수 있다.  


배포한 패키지를 사용할 프로젝트에서도 아래와 같은 셋팅을 해야한다.



```
json
// .yarnrc.yml
npmScopes:
  hoeeeeeh:
    npmRegistryServer: "https://npm.pkg.github.com/"
    npmAuthToken: ${npmAuthToken}

```



그런데 .yarnrc.yml 에는 환경변수를 활용할 수가 없다. yarn v4 에서나 가능하다고 해서 지금 당장 환경변수를 활용하려면 아래와 같은 방법을 사용해야한다.



```
javascript
// .yarn/plugin-env-npm.js
module.exports = {
  name: 'plugin-env-npm',
  factory: require => ({
    hooks: {
      async getNpmAuthenticationHeader(currentHeader, registry, {ident}){
        // only trigger for specific scope
        if (!ident || ident.scope !== 'hoeeeeeh') {
          return currentHeader
        }

        // try getting token from process.env
        let bufEnv = process.env.BUF_REGISTRY_TOKEN
        // alternatively, try to find it in .env
        if (!bufEnv) {
          const fs = require('fs/promises')
          const fileContent = await fs.readFile('../.env', 'utf8')
          const rows = fileContent.split(/\r?\n/)
          for (const row of rows) {
            const [key, value] = row.split(':', 2)
            if (key.trim() === 'GITHUB_REGISTRY_TOKEN') {
              bufEnv = value.trim()
            }
          }
        }

        if (bufEnv) {
          return `${bufEnv}`
        }
        return currentHeader
      },
    },
  }),
}


```



프로젝트 루트에 있는 .yarn 폴더에 plugin-env-npm.js 라는 파일을 하나 작성하자.


내용은 그냥 .env 파일을 불러와서 환경변수를 읽어오는 내용이다.


이후에 `.yarnrc.yml` 에는 아래와 같이 작성하면 된다.



```
javascript
npmScopes:
  hoeeeeeh:
    npmRegistryServer: "https://npm.pkg.github.com/"

plugins:
  - ./.yarn/plugin-env-npm.js

```



프로젝트 루트의 `.env` 도 작성해주자.



```
javascript
GITHUB_REGISTRY_TOKEN: ${TOKEN_VALUE}

```


