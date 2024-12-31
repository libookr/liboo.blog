---
layout: post
current: post
cover: "assets/images/writing.jpg"
navigation: True
title: "ts-pattern"
date: 2024-11-27 04:16:00
tags:
    - 
class: post-template
subclass: 'post'
author: 
  - "Jisukim"
categories:
    - [학습, ]
---

[https://www.npmjs.com/package/ts-pattern/v/4.0.1](https://www.npmjs.com/package/ts-pattern/v/4.0.1)


[https://www.kimcoder.io/blog/ts-pattern](https://www.kimcoder.io/blog/ts-pattern)


[https://toss.tech/article/ts-pattern-usage](https://toss.tech/article/ts-pattern-usage)



```
mermaid
stateDiagram-v2
    [*] --> Initialized: 플레이어 마운트
    %% 공통 플레이어 상태
    state "공통 플레이어 상태" as PlayerState {
        %% 재생 상태
        state "재생 상태" as PlayState {
            Playing --> Paused: 일시정지
            Paused --> Playing: 재생
        }
        %% 볼륨 상태
        state "볼륨 상태" as VolumeState {
            Unmuted --> Muted: 음소거
            Muted --> Unmuted: 음소거 해제
            
            %% 볼륨 레벨
            state "볼륨 레벨" as VolumeLevel {
                [*] --> Normal
                Normal --> Low: 볼륨 감소
                Low --> Normal: 볼륨 증가
                Normal --> High: 볼륨 증가
                High --> Normal: 볼륨 감소
            }
        }
        %% 화면 상태
        state "화면 상태" as ScreenState {
            Normal --> Fullscreen: 전체화면
            Fullscreen --> Normal: 전체화면 종료
        }
        %% 라이브 스트림 상태
        state "라이브 스트림 상태" as LiveState {
            Live --> DVR: 뒤로 이동
            DVR --> Live: 실시간으로 이동
        }
        %% 진행바 상태
        state "진행바 상태" as Progress {
            %% 시청 진행
            state "시청 진행" as TimeProgress {
                [*] --> Watching
                Watching --> Seeking: 진행바 클릭/드래그
                Seeking --> Watching: 시간 이동 완료
            }
            
            %% 버퍼링
            state "버퍼링" as BufferState {
                [*] --> Buffering
                Buffering --> Buffered: 버퍼링 완료
                Buffered --> Buffering: 추가 버퍼링 필요
            }
        }
    }
    %% 컨트롤 UI 상태
    state "컨트롤 UI 상태" as ControlUI {
        Visible --> Hidden: 마우스 멈춤 (3초)
        Hidden --> Visible: 마우스 움직임
    }
    %% 전역 상태 연결
    Initialized --> PlayerState: 초기화 완료
    Initialized --> ControlUI: 초기 컨트롤 상태 설정
    %% 노트: 키보드 컨트롤
    note right of PlayerState
        스페이스바: 재생/일시정지
        F: 전체화면
        좌/우 방향키: 앞/뒤로 이동
    end note

```


