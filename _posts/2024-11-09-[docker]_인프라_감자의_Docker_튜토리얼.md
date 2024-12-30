---
layout: post
current: post
cover: assets/images/writing.jpg
navigation: True
title: "[docker] 인프라 감자의 Docker 튜토리얼"
date: 2024-11-09 06:37:00
tags:
    - 
class: post-template
subclass: 'post'
author: gominzip
categories:
    - [학습, ]
---
<br><br>

> **목차**

undefined
## 🤔 학습 이유


모노레포로 프로젝트를 진행하면서 프론트/백의 통합 CICD 파이프라인을 구축하기 위한 도커 도입이 논의되었으나… 감자인 이슈로 해당 과정을 제대로 이해하지 못했음


## ✔️ 들어가기 전 간단 개념 정리


[https://www.youtube.com/watch?v=eRfHp16qJq8&t=344s](https://www.youtube.com/watch?v=eRfHp16qJq8&t=344s)


컨테이너 = 서버


하나의 서버에서는 하나의 소프트웨어만 실행하는 것이 안정적 → but 리소스 낭비 따라서 <u>가상화 기술을 사용해</u> 하나의 컴퓨터에서 여러개의 소프트웨어를 실행시킴


ex) 하나의 서버에서 소프트웨어를 실행시키는 것은 건물 한층을 한명에게만 임대해주는것.
따라서 임시로 가벽을 세우고 여러명이 쓸 수 있도록. = 서버를 가상화기술로 분리하고 여러 소프트웨어가 실행되도록

- 가상화 방식
	- 전통적으로 **가상머신 Virtual Machine**을 사용
	→ 프로그램을 실행하고 업그레이드하는데 시간이 오래 걸림
	- **컨테이너 Container** : 한대의 서버에서 여러개의 프로그램을 안정적으로 사용가능. 이전의 가상화 기술보다 가볍고 빠르다.

		⇒ Why? 가벽을 설치하고 임대인이 바뀔 때마다 공사를 다시하는 것이 아닌 임대인이 살 수 있는 컨테이너를 만들어놓고 입주 시에 컨테이너를 그대로 집어넣는 방식

- 컨테이너를 직접 만드는 것은 비효율적. 도커는 컨테이너를 관리하는 프로그램. 도커에게 컨테이너를 만들라고 하면 됨.
- 3개의 건물이 생김. 도커도 3개 → 연락이 너무 많이 옴 ⇒ 매니저로 **쿠버네티스** 고용. 컨테이너 오케스트레이션 도구. 오케스트라 지휘자처럼 도커에게 지휘.

> 💡 **요약**  
> - **컨테이너**를 사용하면 한 대의 서버에서 여러 개의 소프트웨어를 안전하고 효율적으로 운영할 수 있다.  
>   
> - **도커**는 컨테이너를 관리하기 위한 도구로 일종의 프로그램이다  
>   
> - **쿠버네티스**는 서버가 여러 대 있는 환경에서 각각의 서버의 도커에게 대신 지시해주는 오케스트레이션 도구이다.

	- **컨테이너**를 사용하면 한 대의 서버에서 여러 개의 소프트웨어를 안전하고 효율적으로 운영할 수 있다.
	- **도커**는 컨테이너를 관리하기 위한 도구로 일종의 프로그램이다
	- **쿠버네티스**는 서버가 여러 대 있는 환경에서 각각의 서버의 도커에게 대신 지시해주는 오케스트레이션 도구이다.

# 💻 가상화 기술 VM vs Docker


![0](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/0.png)


[https://www.youtube.com/watch?v=LXJhA3VWXFA](https://www.youtube.com/watch?v=LXJhA3VWXFA)


### 1. **VM(가상 머신)의 구조**

- **독립된 OS 포함**: 각 VM은 자체적인 **게스트 OS**를 가지고 실행됩니다. VM은 하이퍼바이저(예: VMware, Hyper-V) 위에서 구동되며, 하이퍼바이저는 물리적 하드웨어를 가상화하여 각 VM에 할당합니다.
- **하드웨어 가상화**: VM은 CPU, 메모리, 스토리지 등을 포함하여 하드웨어 리소스를 완전히 가상화합니다. 이를 통해 **각 VM이 마치 독립적인 컴퓨터처럼 동작**하게 됩니다.
- **왜 무거운가?**: 각 VM은 자체 OS를 포함하고 부팅해야 하며, 하드웨어 수준에서의 격리로 인해 많은 리소스를 소모합니다.

### 2. **컨테이너의 구조**

- **커널 공유**: 컨테이너는 호스트 OS의 **커널**을 공유합니다. 즉, 컨테이너는 별도의 커널을 포함하지 않고, 실행에 필요한 사용자 공간만을 포함합니다. 예를 들어, 필요한 라이브러리나 애플리케이션 코드만 포함됩니다.
- **컨테이너 엔진**: Docker와 같은 컨테이너 엔진은 컨테이너를 실행하고 관리하며, 각 컨테이너는 호스트 OS의 커널을 사용하는 가벼운 프로세스 집합으로 작동합니다.
- **왜 가벼운가?**: 커널 수준에서의 격리만으로 애플리케이션의 독립성을 보장하기 때문에 추가 OS 부팅이 필요하지 않아 리소스 소모가 훨씬 적습니다.

### 3. **커널의 역할**

- **커널**은 OS의 핵심 컴포넌트로, 하드웨어와 소프트웨어 간의 중재 역할을 합니다. VM은 각각 독립된 커널을 가상화된 OS에 포함하고 있어야 하지만, 컨테이너는 호스트 OS의 커널을 공유하여 사용합니다. 이는 커널이 하드웨어 리소스를 다루는 중요한 역할을 하기 때문입니다.

⇒ 즉 컨테이너의 경량성과 성능 효율은 바로 이 **커널 공유** 메커니즘 덕분


## 어떻게 호스트 OS 커널 공유가 가능할까? 안전할까?


[https://www.inflearn.com/community/questions/1196236/%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88%EC%9D%98-%EC%BB%A4%EB%84%90-%EA%B3%B5%EC%9C%A0%EC%97%90-%EB%8C%80%ED%95%9C-%EC%9D%98%EB%AC%B8%EC%A0%90?srsltid=AfmBOopmw2RLuT4EqO4XtKl0SuDGqEuKPRJFCZfkicqq4vdpkiUpKcDE](https://www.inflearn.com/community/questions/1196236/%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88%EC%9D%98-%EC%BB%A4%EB%84%90-%EA%B3%B5%EC%9C%A0%EC%97%90-%EB%8C%80%ED%95%9C-%EC%9D%98%EB%AC%B8%EC%A0%90?srsltid=AfmBOopmw2RLuT4EqO4XtKl0SuDGqEuKPRJFCZfkicqq4vdpkiUpKcDE)


리눅스 커널의 특성 덕분입니다. 리눅스 커널은 프로세스 간의 격리를 위해 **네임스페이스(namespaces)**와 **컨트롤 그룹(cgroups)** 같은 기술을 제공합니다.

- **네임스페이스**: 각 컨테이너는 네임스페이스를 통해 다른 컨테이너 및 호스트 시스템과 격리됩니다. 네임스페이스는 프로세스 ID, 네트워크, 마운트 포인트, 사용자 ID 등 시스템 리소스의 독립적인 뷰를 제공합니다. 예를 들어, 네트워크 네임스페이스는 컨테이너 간의 네트워크 트래픽을 분리해 줍니다.
- **컨트롤 그룹(cgroups)**: cgroups는 컨테이너가 사용하는 CPU, 메모리, 디스크 I/O와 같은 리소스를 제한하고 관리합니다. 이를 통해 하나의 컨테이너가 리소스를 과도하게 사용해 호스트나 다른 컨테이너에 영향을 미치지 않도록 합니다.

→ 커널 레벨에서 발생할 수 있는 문제가 다른 컨테이너에 영향을 줄 수 있는 단점도 있지만 컨테이너 자체의 보안 기능(seccomp, AppArmor 등)과 쿠버네티스와 같은 오케스트레이션 툴을 통해 멀티 텐트 환경에서도 충분한 격리와 관리가 가능하도록 설계 가능


아직 운영체제를 안 들어서 딥다이브하지 못해 아쉽..


# 🐳 Docker


Go언어로 작성된 리눅스 컨테이너 기반으로 하는 어플리케이션을 **패키징** 할 수 있는 툴. 오픈소스 가상화 플랫폼

- 컨테이너라는 작은 소프트웨어 유닛 안에 어플리케이션, 시스템 툴, 디펜던시를 하나로 묶어서 다른 서버 등 쉽게 배포하고 구동 할 수 있게 함.

## Building Containers


### Dockerfile


컨테이너를 어떻게 만들어야 한다는 레시피

- Copy file
- Install dependencies
- Set environment variables
- Run setup scripts

### Image


Dockerfile을 기반으로 생성.


어플리케이션 실행에 필요한 코드, 런타임 환경, 시스템 툴, 시스템 라이브러리 등의 세팅을 포함시킴 ⇒ 현재 어플리케이션의 상태를 스냅샷으로 저장한 형태.


만들어진 이미지는 **불변함.**


### Container


샌드박스처럼 우리가 캡처해둔 어플리케이션의 이미지를 고립된 환경에서 개별적인 파일 시스템 안에서 실행할 수 있는 것.


이미지를 이용해서 어플리케이션을 구동! 


Image라는 클래스로 각 인스턴스(스냅샷)을 찍어내고 그 인스턴스를 가지는 각각의 컨테이너를 만들어낸다. → 컨테이너에서 각각 동작하는 어플리케이션은 개별적으로 수정이 가능함. 수정된 파일은 이미지에 영향을 끼치지 않음 


## Shipping Containers


![1](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/1.png)


### Container Registry


public과 private으로 나뉨. 회사에서는 대부분 private 이용

- public
	- Docker Hub, Red Hat quay.io, Github Packages
- private
	- AWS, Google Cloud, MS Azure

![2](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/2.png)


## 실습 (1)


### Dockerfile


[https://docs.docker.com/build/building/best-practices/](https://docs.docker.com/build/building/best-practices/)



```
css
FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY index.js .

ENTRYPOINT [ "node", "index.js" ]

```


1. FROM: 베이스 이미지를 지정. alpine은 최소단위의 리눅스 버전.
[https://hub.docker.com/_/node/](https://hub.docker.com/_/node/)
2. WORKDIR: 컨테이너 안에서 어떤 경로에 실행할건지를 명시
ex. /app ⇒ 루트 경로의 app이라는 디렉토리안에 프로젝트 관련 파일을 모두 copy하겠다
3. COPY: 도커 파일에서 카피하고 명령어를 실행하는 것은 <u>**레이어 시스템**</u>으로 구성. 따라서 빈번히 변경되는 파일일수록 제일 마지막에 작성하는 것이 좋음 
ex. 소스코드를 담은 index.js가 package.json보다는 빈번히 변경될 가능성이 높음 → 따라서 package.json을 가장 먼저 복사해오도록 작성
4. RUN: npm install보다 npm ci를 쓰는게 좋음. 
why? install은 프로젝트에서 사용된 것보다 높은 버전이 나오면 그 버전으로 설치가 되는 이슈 있음. ci를 쓰면 lock.json에 쓰인 버전으로 설치가 가능.
+) yarn install은 yarn.lock 파일이 존재하면 npm ci와 비슷한 방식으로 정확한 버전을 설치해서 일관성 유지 → 그런데 우리 플젝 yarn.lock 날렸는데… 괜찮은건가요?
5. COPY: 소스코드 카피
6. ENTRYPOINT: 배열에 담긴 커맨드를 합쳐서 실행

### Dockerfile의 레이어 시스템


![3](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/3.png)


빈번하게 변경되는 것을 하위 레이어에 두어서 이미지 생성 시간을 감축시킨다.


### 이미지 만들기



```
bash
docker build -f Dockerfile -t fun-docket . 

```


- `.` : build context, 도커파일이 있는 경로를 지정
- `-f Dockerfile` : 어떤 도커파일을 쓸건지 지정
- `-t fun-docket` : 이미지에 이름 부여. 태그

![4](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/4.png)



```
bash
docker images

```



![5](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/5.png)_오타 이슈.._

- 로컬에서 만들어진 이미지 확인
- container registry에 올릴때 repository 이름이 사용됨
- tag는 이미지 버전을 뜻함

### 이미지 실행



```
bash
docker run -d -p 8080:8080 fun-docker

```


- `-d` : detached. 백그라운드에서 계속 동작하도록 함
- `-p` : 포트 지정. 호스트머신의 포트와 컨테이너의 포트를 연결

	![6](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/6.png)



```
bash
docker ps

```



![7](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/7.png)

- 현재 실행 중인 컨테이너의 리스트


```
bash
docker logs {컨테이너 id}

```



![8](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/8.png)

- 컨테이너 터미널에서 발생하는 로그 확인
- 도커 데스크톱에서도 확인 가능

![9](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/9.png)


+) 로그인이 계속 Denied 되는 이슈가 있었는데 도커 브라우저의 캐시를 지우고 다시 시도하니 잘 됐음


### 이미지 배포 with DockerHub


![10](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/10.png)

- docker push gominzip/docker-example:tagname로 만들었으면 로컬 이미지 이름도 레포지토리와 동일하게 docker-example로 일치시켜줘야함
- 변경 방법

	
```
bash
	docker tag fun-docket:latest gominzip/docker-example:latest
	
```



![11](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/11.png)

- 로그인하기

	
```
bash
	docker login
	
```


- 이미지 push

	
```
bash
	docker push gominzip/docker-example:latest
	
```



![12](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/12.png)


![13](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/13.png)_업로드 된 모습_


# 🙌 Docker Compose


[https://www.youtube.com/watch?v=3FY-DzXYu7E](https://www.youtube.com/watch?v=3FY-DzXYu7E)


compose 파일은 도커 어플리케이션의 서비스, 네트워크, 볼륨 등의 설정을 yaml 형식으로 작성하는 파일


[https://docs.docker.com/compose/intro/compose-application-model/](https://docs.docker.com/compose/intro/compose-application-model/)


![14](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/14.png)


## 공식문서 코드로 이해하기


프론트엔드와 백엔드로 나누어진 프로젝트의 예시



```
yaml
services:
  frontend:
    image: example/webapp  # 프런트엔드 서비스는 'example/webapp' 이미지를 사용
    ports:
      - "443:8043"  # 호스트의 443 포트를 컨테이너의 8043 포트에 매핑 (외부 HTTPS 접근 가능)
    networks:
      - front-tier  # 외부와의 통신을 위한 네트워크
      - back-tier   # 백엔드와의 내부 통신을 위한 네트워크
    configs:
      - httpd-config  # 외부에서 제공되는 HTTP 설정 파일을 주입
    secrets:
      - server-certificate  # 외부에서 제공되는 HTTPS 인증서를 주입

  backend:
    image: example/database  # 백엔드 서비스는 'example/database' 이미지를 사용
    volumes:
      - db-data:/etc/data  # 'db-data'라는 볼륨을 컨테이너의 /etc/data 경로에 마운트 (데이터 저장)
    networks:
      - back-tier  # 프런트엔드와의 내부 통신을 위한 네트워크

volumes:
  db-data:
    driver: flocker  # 'flocker' 드라이버를 사용하여 볼륨을 관리
    driver_opts:
      size: "10GiB"  # 볼륨 크기를 10GiB로 설정

configs:
  httpd-config:
    external: true  # 이 설정 파일은 외부에서 제공됨 (Compose가 생성하지 않음)

secrets:
  server-certificate:
    external: true  # 이 비밀은 외부에서 제공됨 (Compose가 생성하지 않음)

networks:
  # 다음 네트워크는 객체만 정의하면 충분 (세부 설정은 생략)
  front-tier: {}  # 프런트엔드가 사용하는 네트워크
  back-tier: {}   # 프런트엔드와 백엔드 간의 내부 통신 네트워크

```


- 주 구성 요소
	- services
	- volumes
	- configs
	- secrets
	- networks

	⇒ service를 제외하고는 실무에서 잘 사용하지 않는 듯


## Services


services는 여러 컨테이너를 정의하는데 사용됨



```
yaml
services:
  frontend:
    image: example/webapp

  backend:
    image: example/database 

```



→ frontend와 backend는 각 컨테이너를 정의하게 되며 컨테이너의 이름이 됨


### 설정 키워드


![15](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/15.png)


### **실행 명령어 및 상태 확인**

- **`docker compose up`**: 프런트엔드와 백엔드 서비스를 시작하고, 필요한 네트워크와 볼륨을 생성하며, 설정 파일과 비밀을 프런트엔드 서비스에 주입.
- **`docker compose ps`**: 현재 실행 중인 컨테이너의 상태를 보여주어 어떤 컨테이너가 실행 중인지, 상태는 어떤지, 그리고 사용 중인 포트를 확인 가능.
- **`docker-compose -f docker-compose-custom.yml up`**: docker-compose는 기본적으로 ‘docker-compose.yml’ 또는 ‘docker-compose.yaml’의 이름을 사용. 만약 다른 이름으로 관리시 -f 옵션 사용
- **`docker-compose -d`** : 백그라운드에서 docker-compose를 실행하기 위해 사용

## 실습 (2)


Dockerfile



```
yaml
FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

```



docker-compose.yml



```
yaml
version: "3"
services:
  web:
    build: .
    ports:
      - "3000:8080"  # 3000은 호스트 포트, 8080은 컨테이너 포트
    depends_on:
      - database
  database:
    image: mongo:6
    ports:
      - "27017:27017"

```



![16](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/16.png)


![17](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/17.png)


![18](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/18.png)


각 서비스 컨테이너가 실행


![19](/upload/2024-11-09-[docker]_인프라_감자의_Docker_튜토리얼.md/19.png)


호스트의 3000번 포트로 잘 열림


근데 DB는 이렇게 하는거 아닌거 같음 ㅇㅅㅇ..


아무튼 작동 방식 이해 완.


# 💬 학습 후기


늘 인프라에 대한 진입장벽이 있었는데 실습하면서 테스트해보니 그렇게 복잡한 느낌은 아니었다. 실제 프로젝트에 도입하는걸 보면서 쓰이는 이유를 직접 체감해보고 싶다.

