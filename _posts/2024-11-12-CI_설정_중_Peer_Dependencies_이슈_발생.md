---
layout: post
current: post
cover: assets/images/writing.jpg
navigation: True
title: "CI 설정 중 Peer Dependencies 이슈 발생"
date: 2024-11-12 09:46:00
tags:
    - 
class: post-template
subclass: 'post'
author: 
    - [gominzip, ]
categories:
    - [트러블슈팅, ]
---
<br><br>

## 문제 상황


ci를 위한 스크립트 작성중 lint에 대한 의존성 충돌 이슈가 발생 했다.



```
bash
Oops! Something went wrong! :(

ESLint: 9.14.0

Error: @typescript-eslint/utils tried to access eslint (a peer dependency) but it isn't provided by its ancestors; this makes the require call ambiguous and unsound.

Required package: eslint (via "eslint/use-at-your-own-risk")
Required by: @typescript-...

```



## 원인


[https://velog.io/@hoon0123/peerdependency-%EB%B0%95%EC%82%B4%EB%82%9C%EA%B1%B0-%ED%95%B4%EA%B2%B0%ED%95%B4%EC%95%BC%ED%95%B4](https://velog.io/@hoon0123/peerdependency-%EB%B0%95%EC%82%B4%EB%82%9C%EA%B1%B0-%ED%95%B4%EA%B2%B0%ED%95%B4%EC%95%BC%ED%95%B4) ← 참고 블로그


해당 오류는 `@typescript-eslint/utils` 패키지가 `eslint`를 **peer dependency**로 요구하지만, 해당 의존성이 yarn의 의존성 트리에서 제대로 제공되지 않는 경우에 발생한다.


### Peer dependency란?


[https://mitchell-up.github.io/mitchell-dictionary/docs/terms/peer-dependency/](https://mitchell-up.github.io/mitchell-dictionary/docs/terms/peer-dependency/)


일반적인 dependency는 패키지 자체에 필요한 모듈을 의미하며, 해당 패키지를 설치할 때 함께 설치된다.


peer dependency란 라이브러리나 플러그인에서 사용하는 패키지 중에서 라이브러리를 사용하는 **사용자가 직접 설치해야 하는 패키지**를 의미한다.


예를 들어 `eslint-plugin-react`는 React와 관련된 ESLint 규칙을 제공합니다. 이 플러그인은 `eslint`와 함께 사용해야 하므로, `eslint`를 peer dependency로 지정해주어야 한다.


## 문제 해결 과정


문제 목록을 확인하기 위해선 `yarn explain peer-requirements` 명령어로 확인해 볼 수 있다.


문제가 발생한 라이브러리와 제공되지 않은 라이브러리를 확인해볼 수 있다.



```
bash
→ ✘ @typescript-eslint/utils@npm:8.14.0 [60205] doesn't provide typescript to @typescript-eslint/typescript-estree@npm:8.14.0 [55f0c] and 1 other dependency

```



⇒ `@typescript-eslint/utils@npm:8.14.0` 패키지가 하위 의존성들에게 typescript를 요구받고 있으나 제공을 못하고 있음


.yarnrc.yml 파일의 packageExtensions에 문제가 발생하는 패키지별 peerDependencies를 추가해주면 된다.



```
yaml
yarnPath: .yarn/releases/yarn-4.5.1.cjs
nodeLinker: pnp

packageExtensions:
  '@typescript-eslint/utils@*':
    peerDependencies:
      eslint: '*'
      typescript: '*'
  '@typescript-eslint/type-utils@*':
    peerDependencies:
      eslint: '*'
      typescript: '*'
  'typescript-eslint@*':
    peerDependencies:
      eslint: '*'

```



## 왜 의존성에 있음에도 설정을 해줘야했을까?


**packageExtensions**는 Yarn에서 PnP 방식으로 의존성을 관리할 때, **특정 패키지에 누락된 의존성을 추가하거나 의존성 해결 방식을 조정**하는 기능을 제공한다. 


이 설정은 주로 peerDependency로 명시된 의존성이 **실제로 존재하지 않거나 잘못 설정된 경우**, 해당 의존성을 수동으로 추가해야 할 때 사용한다.


즉, **Yarn PnP**에서는 `eslint`가 의존성에 포함되어 있어도, `eslint`를 **명시적으로** **`peerDependency`****로 추가**해야 **해당 패키지가 제대로 작동**할 수 있다. 이는 Yarn PnP의 의존성 해결 방식이 **`node_modules`** **방식과 다르기 때문에 발생하는 현상이다.**


따라서, `eslint`가 의존성에 존재하더라도 **`peerDependency`****로 명시해주지 않으면**, Yarn PnP 시스템에서 해당 의존성을 제대로 해결하지 못할 수 있다..


의존성 문제가 복잡하여 특히 현재와 같은 모노레포에서 어떤 방식으로 패키지를 관리하는 것이 좋을지 고민이 깊어지는 것 같다

