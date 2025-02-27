---
layout: post
current: post
cover: "upload/2024-11-12-Docker,_Container,_k8s_알아보기.md/0.png"
navigation: True
title: "Docker, Container, k8s 알아보기"
date: 2024-11-12 10:20:00
tags:
    - 
class: post-template
subclass: 'post'
author: 
  - "홍창현"
categories:
    - [학습, ]
---

## Docker


도커는 "app을 packaging 할 수 있는 툴" 이다.

- **이미지**: 애플리케이션과 모든 의존성을 포함한 읽기 전용 템플릿입니다. `Dockerfile`을 통해 이미지를 정의하고, 이를 바탕으로 컨테이너를 생성합니다.
- **컨테이너**: 이미지를 실행한 인스턴스입니다. 각 컨테이너는 독립된 환경에서 작동하며, 서로 격리된 상태로 실행됩니다.
- **Dockerfile**: 이미지 생성을 위한 설정 파일로, 설치할 패키지나 애플리케이션 설정 등을 정의합니다.

[https://velog.io/@sorzzzzy/Docker-2.-%EB%8F%84%EC%BB%A4%EC%9D%98-%EB%8F%99%EC%9E%91-%EC%9B%90%EB%A6%AC-%EB%8F%84%EC%BB%A4%EC%9D%98-%ED%97%88%EB%B8%8C-%EC%9D%B4%EB%AF%B8%EC%A7%80](https://velog.io/@sorzzzzy/Docker-2.-%EB%8F%84%EC%BB%A4%EC%9D%98-%EB%8F%99%EC%9E%91-%EC%9B%90%EB%A6%AC-%EB%8F%84%EC%BB%A4%EC%9D%98-%ED%97%88%EB%B8%8C-%EC%9D%B4%EB%AF%B8%EC%A7%80)


[https://velog.io/@gkrry2723/%EC%9B%90%EB%A6%AC-%EA%B3%B5%EB%B6%80-Docker%EB%9E%80-%EB%8F%84%EC%BB%A4-%EB%8F%99%EC%9E%91-%EC%9B%90%EB%A6%AC-%EB%8F%84%EC%BB%A4-%EA%B0%9C%EB%85%90](https://velog.io/@gkrry2723/%EC%9B%90%EB%A6%AC-%EA%B3%B5%EB%B6%80-Docker%EB%9E%80-%EB%8F%84%EC%BB%A4-%EB%8F%99%EC%9E%91-%EC%9B%90%EB%A6%AC-%EB%8F%84%EC%BB%A4-%EA%B0%9C%EB%85%90)


### ✔️ 도커 허브란?


**도커 허브**는 공식적으로 운영되는 도커 레지스토리(도커 이미지를 배포하는 서비스)의 이름으로, **공개된 컨테이너의 이미지가 모여있는 곳**이다.


도커 허브는 스마트폰의 앱스토어와 같은 존재로 **다양한 공개 컨테이너 이미지가 제공**된다.


누구든지 이미지를 등록하고 공개하는 등 편리하게 이용할 수 있고, 이미지의 종류도 다양하다.


### 도커의 컨테이너 공유


![0](/upload/2024-11-12-Docker,_Container,_k8s_알아보기.md/0.png)_image.png_


---


### 컨테이너


커널에서 제공하는 기능인 Cgroup과 Namespace를 잘 활용하여 만든 기술


![1](/upload/2024-11-12-Docker,_Container,_k8s_알아보기.md/1.png)_image.png_

- 이미 있던 기술
	- 컨테이너 기술은 완전히 새로운 개념이 아니라, 오랜 기간 존재해왔던 시스템 격리 기술에서 발전한 것
	- 대표적인 격리 기술인 `Cgroups`과 `Namespaces`가 리눅스 커널에서 오래전부터 지원되었고, Docker 같은 도구들이 이를 현대적인 애플리케이션 개발과 배포에 쉽게 적용할 수 있게 함
- 하나의 서버에 하나의 소프트웨어가 실행되는 것이 안전하고 일반적
	- 서버(32기가 ~ 256기가)에 하나의 서비스(2기가 ~ 4기가)가 사용되는 것은 매우 비효율적
	- 비효율적인 문제를 해결하기 위해 가상화기술 도입
	- 초기에는 하이퍼바이저 기반의 **가상 머신(VM) 기술**이 도입됨
	- 이후 컨테이너화 기술은 가상 머신보다 더 가벼운 격리 및 가상화를 가능하게 하여 빠르게 자리를 잡음 (= **컨테이너**)

### 컨테이너와 VM


![2](/upload/2024-11-12-Docker,_Container,_k8s_알아보기.md/2.png)_image.png_

- **컨테이너**는 같은 운영체제 커널을 공유하면서 독립적인 환경을 제공합니다. 각 컨테이너는 애플리케이션과 필요한 의존성을 포함하여 호스트 OS의 커널 위에서 실행됩니다.
- **가상 머신**은 하이퍼바이저를 통해 호스트 시스템에서 여러 개의 게스트 OS를 각각 실행합니다. 이로 인해 더 많은 리소스를 사용하며, 부팅 시간도 컨테이너보다 느립니다.

### 컨테이너, 도커, 쿠버네티스

- Docker는 가장 널리 사용되는 컨테이너화 도구로, 애플리케이션을 패키징하고 배포할 수 있도록 해 줌
- Docker는 컨테이너 이미지를 만들고, 해당 이미지를 컨테이너로 실행할 수 있게 해주며, 이 과정을 간단하게 자동화할 수 있는 다양한 도구와 명령어를 제공

![3](/upload/2024-11-12-Docker,_Container,_k8s_알아보기.md/3.png)_image.png_


![4](/upload/2024-11-12-Docker,_Container,_k8s_알아보기.md/4.png)_image.png_


## 배포 전 과정


### 1. 로컬에서 코드 수정 후 푸시

- 로컬에서 코드를 수정한 후 GitHub 저장소의 특정 브랜치(예: `main`)로 푸시
- 푸시가 완료되면 **GitHub Actions**가 자동으로 해당 푸시 이벤트를 트리거하고, `.github/workflows/deploy.yml` 파일에서 정의한 워크플로우가 실행

### 2. GitHub Actions 워크플로우 시작

- `deploy.yml`에 정의된 워크플로우는 푸시 이벤트를 감지하고, 전체 배포 파이프라인을 실행

### 3. 워크플로우의 주요 단계


### **a. 코드 체크아웃 (Checkout Code)**

- `actions/checkout@v3` 액션을 사용해 최신 커밋 상태의 코드를 가져옴
- 이 단계에서 현재 GitHub 리포지토리의 코드가 GitHub Actions 워크플로우 내에 로드됨

### **b. Docker 이미지 빌드 (Build Docker Image)**

- `Dockerfile`에 정의된 설정에 따라 애플리케이션의 Docker 이미지를 빌드
- 이 단계에서는 애플리케이션의 모든 의존성과 환경 설정이 Docker 이미지에 포함됨
- `docker-compose.yml`이 있더라도 CI/CD에서는 보통 서비스별로 이미지를 개별적으로 빌드함

### **c. Docker Hub 또는 컨테이너 레지스트리로 이미지 푸시 (Push Docker Image)**

- Docker 이미지를 빌드한 후, 해당 이미지를 Docker Hub 또는 AWS ECR, GCP GCR과 같은 컨테이너 레지스트리로 푸시

### **d. Kubernetes 클러스터에 배포 (Deploy to Kubernetes)**

- Kubernetes 클러스터에 새 이미지를 사용하여 애플리케이션을 배포
- Kubernetes의 `kubectl` 명령어 또는 GitHub Actions의 Kubernetes 관련 플러그인을 사용해 배포가 가능
- 이 단계에서는 배포를 위해 `kubectl apply` 명령어를 사용하여 `Deployment` 리소스가 새 이미지를 참조하도록 업데이트

### 4. 롤링 업데이트 (Rolling Update)

- Kubernetes의 **롤링 업데이트** 방식을 통해 Pod를 하나씩 교체하면서 새 버전으로 전환
- Kubernetes는 새 이미지로 교체된 Pod의 상태를 모니터링하며, 문제가 발생할 경우 롤백
- 이 과정을 통해 **무중단 배포**가 가능하며, 사이트는 **최신 버전의 애플리케이션으로 안전하게 업데이트**
