---
layout: post
current: post
cover: assets/images/writing.jpg
navigation: True
title: "🐬 서버를 docker swarm 으로 관리해보자"
date: 2024-12-04 05:41:00
tags:
    - 
class: post-template
subclass: 'post'
author: hoeeeeeh
categories:
    - [과정/근거, ]
---


# 기존 서버 운영 방식


![0](/upload/2024-12-04-🐬_서버를_docker_swarm_으로_관리해보자.md/0.png)_최초의 서버 설계_


최초의 서버 설계에서는 NCP 서버 인스턴스 1대에 NGINX, 채팅 서버, API 서버, RTMP 서버가 각각 1개의 컨테이너씩 띄워져있는 구조였습니다.


그러나 시간이 지나면서 각각의 서버를 수평 확장할 필요성을 느끼고 서버를 수평 확장 할 수 있도록 설계를 수정하고 보니 컨테이너를 어떻게 관리하고, 또 ncp 서버 인스턴스를 어떻게 추가/삭제 하면서 관리해야할지에 대한 어려움이 생겼습니다.


## Docker Swarm


도커 스웜은 쿠버네티스와 함께 이야기되는 대표적인 컨테이너 오케스트레이션 도구입니다.  이름에서부터 알 수 있듯이 도커 엔진을 그대로 쓰기 때문에 간단한 설정만으로도 클러스터와 서비스들을 관리할 수 있습니다.


엔터프라이즈 레벨의 운영을 한다면 쿠버네티스가 조금 더 좋았겠지만 아직까지는 저희 프로젝트에서 네트워킹이나 Volume 등을 고려해봤을 때, 간편하게 설정할 수 있는 도커 스웜을 사용하는 것이 좋다고 생각했습니다.


## 클러스터링


![1](/upload/2024-12-04-🐬_서버를_docker_swarm_으로_관리해보자.md/1.png)


![2](/upload/2024-12-04-🐬_서버를_docker_swarm_으로_관리해보자.md/2.png)


저희 팀은 기존에 메인 production 서버 1대, 테스트용 development 서버 1대로 총 2대 가동 하고 있었습니다.


그리고 개발이 어느정도 마무리 되는 시점인 6주차에 접어들면서 테스트용 development 서버의 활용성이 점점 떨어졌고, 부하 테스트나 데모 용도로 production 서버에 부하가 점점 늘어났습니다. 


그래서 기존의 test 서버를 production 서버와 클러스터링 하면서 도커 컨테이너 기반으로 서비스를 운영하고 있습니다.


![3](/upload/2024-12-04-🐬_서버를_docker_swarm_으로_관리해보자.md/3.png)


![4](/upload/2024-12-04-🐬_서버를_docker_swarm_으로_관리해보자.md/4.png)


위의 이미지에서 보시다시피 main, test 2개의 서버에 chat-server (replica 3), main-server, rtmp-server (replica 3), nginx 컨테이너를 나누어 실행하고 있습니다.


Docker Swarm 은 아쉽게도 쿠버네티스처럼 컨테이너에 대한 메트릭을 자동으로 수집해서 오토 스케일링을 하는 작업을 공식적으로 제공하지는 않습니다. 따라서 현재는 수동적으로 ncp 인스턴스를 클러스터링하고 서비스의 scale 을 늘리고 줄여야 합니다.


하지만 메트릭 수집과 자동 스케일링을 할 수 있도록 스크립트를 작성하는 방식으로 리팩토링 하여 오토 스케일링을 구현할 예정입니다.

