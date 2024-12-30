---
layout: post
current: post
cover: assets/images/writing.jpg
navigation: True
title: "[docker] yarn-berry workspace 를 찾지 못하는 오류"
date: 2024-11-07 09:56:00
tags:
    - [docker, ]
class: post-template
subclass: 'post'
author: 
    - [hoeeeeeh, ]
categories:
    - [트러블슈팅, ]
---
<br><br>

패키지매니저를 yarn-berry 로 쓰고 dockerfile 을 아래와 같이 작성했는데


yarn install 을 하면서 


`Error: nodeMediaServer@workspace:^: Workspace not found (nodeMediaServer@workspace:^)`


라는 오류가 발생했다.



```
yaml
FROM node:20-alpine

RUN corepack enable

# Setting working directory
WORKDIR /app

# Copying package.json and package-lock.json
COPY package*.json ./

# Installing dependencies
RUN yarn install

# Install FFmpeg. This is needed to convert the video to HLS
RUN apk add --no-cache ffmpeg

# /usr/bin/ffmpeg is the default path for ffmpeg, copy it to /app
RUN cp /usr/bin/ffmpeg ./

# Copying all the files
COPY . .

# Exposing ports
EXPOSE 8000
EXPOSE 1935

# Running the app
CMD ["yarn", "start"]


```




```
basic
[+] Building 3.9s (9/12)                                                                                                                                                                                            docker:desktop-linux
 => [media-server internal] load build definition from dockerfile                                                                                                                                                                   0.0s
 => => transferring dockerfile: 573B                                                                                                                                                                                                0.0s
 => [media-server internal] load .dockerignore                                                                                                                                                                                      0.0s
 => => transferring context: 2B                                                                                                                                                                                                     0.0s
 => [media-server internal] load metadata for docker.io/library/node:20-alpine                                                                                                                                                      1.0s
 => [media-server 1/8] FROM docker.io/library/node:20-alpine@sha256:c13b26e7e602ef2f1074aef304ce6e9b7dd284c419b35d89fcf3cc8e44a8def9                                                                                                0.0s
 => [media-server internal] load build context                                                                                                                                                                                      0.0s
 => => transferring context: 6.16kB                                                                                                                                                                                                 0.0s
 => CACHED [media-server 2/8] RUN corepack enable                                                                                                                                                                                   0.0s
 => CACHED [media-server 3/8] WORKDIR /app                                                                                                                                                                                          0.0s
 => [media-server 4/8] COPY package*.json ./                                                                                                                                                                                        0.0s
 => ERROR [media-server 5/8] RUN yarn install                                                                                                                                                                                       2.9s
------
 > [media-server 5/8] RUN yarn install:
0.483 ! Corepack is about to download https://repo.yarnpkg.com/4.5.1/packages/yarnpkg-cli/bin/yarn.js
0.912 ➤ YN0000: · Yarn 4.5.1
0.923 ➤ YN0000: ┌ Resolution step
1.030 ➤ YN0001: │ Error: nodeMediaServer@workspace:^: Workspace not found (nodeMediaServer@workspace:^)
1.030     at t.getWorkspaceByDescriptor (/root/.cache/node/corepack/v1/yarn/4.5.1/yarn.js:210:3520)
1.030     at t.getCandidates (/root/.cache/node/corepack/v1/yarn/4.5.1/yarn.js:140:117086)
1.030     at Pg.getCandidates (/root/.cache/node/corepack/v1/yarn/4.5.1/yarn.js:141:1311)
1.030     at Pg.getCandidates (/root/.cache/node/corepack/v1/yarn/4.5.1/yarn.js:141:1311)
1.030     at /root/.cache/node/corepack/v1/yarn/4.5.1/yarn.js:210:8420
1.030     at Jm (/root/.cache/node/corepack/v1/yarn/4.5.1/yarn.js:140:53873)
1.030     at gt (/root/.cache/node/corepack/v1/yarn/4.5.1/yarn.js:210:8400)
1.030     at async Promise.allSettled (index 1)
1.030     at async Yc (/root/.cache/node/corepack/v1/yarn/4.5.1/yarn.js:140:53201)
1.030 ➤ YN0000: └ Completed
1.030 ➤ YN0000: · Failed with errors in 0s 119ms
------
failed to solve: process "/bin/sh -c yarn install" did not complete successfully: exit code: 1


```



이유는 COPY 와 yarn install 의 순서 때문이었다.


올바른 도커파일



```
yaml
FROM node:20-alpine

RUN corepack enable

# Setting working directory
WORKDIR /app

# Copying package.json and package-lock.json
COPY package*.json ./

# Install FFmpeg. This is needed to convert the video to HLS
RUN apk add --no-cache ffmpeg

# /usr/bin/ffmpeg is the default path for ffmpeg, copy it to /app
RUN cp /usr/bin/ffmpeg ./

# Copying all the files
COPY . ./

# Installing dependencies
RUN yarn install

# Exposing ports
EXPOSE 8000
EXPOSE 1935

# Running the app
CMD ["yarn", "start"]


```



COPY . . 를 해야 yarn install 을 하면서 워크스페이스를 찾을텐데, copy 전에 yarn install 을 먼저 해서 워크스페이스를 찾을 수 없었던 것이다.

