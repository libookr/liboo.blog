---
layout: post
current: post
cover: "upload/2024-12-04-React-Query로_안정적인_스트리밍을_위한_로딩_및_에러_관리하기.md/0.png"
navigation: True
title: "React-Query로 안정적인 스트리밍을 위한 로딩 및 에러 관리하기"
date: 2024-12-04 03:09:00
tags:
    - [react-query, ]
class: post-template
subclass: 'post'
author: 
  - "홍창현"
categories:
    - [과정/근거, ]
---

## 🚨 문제 인식


HLS영상을 비동기로 데이터를 받아올 때 각각의 컴포넌트에서 각각의 방식으로 로딩 및 에러처리를 처리했고, 그 결과 일정 **코드가 중복**되었고 **비효율적**이었다. 이를 체계화하여 비동기로 데이터를 받아올 때의 상황을 정리할 필요성이 있었다.


**기존의 코드**



```
typescript
const MainLiveSection = ({ title, type }: MainLiveSectionProps) => {
  const { data = [], isLoading, error } = useRecentLive();

  if (error) {
    return <div>데이터를 가져오는 중 에러가 발생했습니다.</div>;
  }

  return (
    <MainSectionContainer>
      <MainSectionHeader>
        <p className="live_section_title">{title}</p>
        <button className="live_section_button">전체보기</button>
      </MainSectionHeader>

      {isLoading && <div>로딩 중...</div>}

      {data.length === 0 && !isLoading && <div>데이터가 없습니다.</div>}
				// 코드 생략
    </MainSectionContainer>
  );
};

```



위와 같은 코드가 커스텀 훅으로 데이터를 가져오는 컴포넌트마다 있었다. `isLoading`과 `error`일때 각각 연산자와 조건문을 통해서 처리했었다.


## 🏃 해결 과정


### 관심사를 분리할 것


컴포넌트의 역할을 렌더링되는 것에만 **집중**

- 비지니스 로직
- 렌더링 로직

로딩과 에러처리는 해당 컴포넌트의 **관심사에서 벗어난다고 판단**


→ 로딩과 에러처리 역할을 **부모(처리해야할 부분)**로 위임


### Suspense처리를 왜 해야하는가에 대한 의문


기존에 간단하게 로딩시에는



```
typescript
{isLoading && <div>로딩 중...</div>}

```



와 같이 비동기 데이터를 가져올 때 걸리는 시간에 대해서 크게 고민하지 않았다. 또한, 단순히 사용자 경험의 향상이라는 이유로 로딩처리를 하는 것이라 판단했지만 최적화와도 관련이 있었다.

- 레이아웃 시프트 (`Layout Shift`)
	- 웹 페이지의 요소들이 예상치 못하게 이동하는 현상
	- 기존에 계산되었던 Layout이 다시 계산되는 문제가 있음

`Layout Shift` 현상이 일어나지 않도록 하기 위해서 보여줘야하는 컴포넌트와 크기가 같은 컴포넌트를 `Suspense` fallback컴포넌트에 보내주게 되면 Layout이 다시 계산되지 않아서 **사용자 경험**과 **최적화**를 동시에 해결할 수 있음



```
typescript
<Suspense fallback={<RecommendLiveSkeleton />}>
  <DataComponent />
</Suspense>

```



Suspense의 fallback컴포넌트에 `skeleton`을 직접 만들어서 대응

- skeleton 라이브러리 선정
	- react-loading-skeleton, react-skeleton-loader : 간단하고 빠르게 적용
	- **`react-content-loader`** : 디자인을 **커스터마이징** 가능 (svg 기반)
- 초기 로딩화면

![0](/upload/2024-12-04-React-Query로_안정적인_스트리밍을_위한_로딩_및_에러_관리하기.md/0.png)_image.png_

- 개선 후

![1](/upload/2024-12-04-React-Query로_안정적인_스트리밍을_위한_로딩_및_에러_관리하기.md/1.png)_%EC%97%90%EB%9F%AC%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8.gif_


추가로, 웹페이지의 성능지표인 **CLS(Cumulative Layout Shift)**를 통해서 `Layout Shift` 빈도를 측정할 수 있음


[https://wit.nts-corp.com/2020/12/28/6240](https://wit.nts-corp.com/2020/12/28/6240)


### React-Query를 활용하여 Suspense 처리하기


React-Query의 버전이 달라지면서 `DefaultOptions` 속성에서 `suspense` 속성이 제거됨


![2](/upload/2024-12-04-React-Query로_안정적인_스트리밍을_위한_로딩_및_에러_관리하기.md/2.png)_image.png_


`OmitKeyof` 속성을 통해 `suspense`가 빠진 것을 확인 할 수 있었다.


`Suspense`를 지원하는 새로운 훅이 있었다.

- useSuspenseQuery
- useSuspenseQueries

위의 suspenseQuery는 기존의 useQuery의 기능에 React의 **Suspense를 자동적으로 지원**해주는 훅이다.



```
typescript
export const useMainLive = () => {
  return useSuspenseQuery<MainLive[], Error>({
    queryKey: ['mainLive'],
    queryFn: fetchMainLive,
    refetchOnWindowFocus: false,
  });
};

```



### Suspense와 ErrorBoundary의 통합


**ErrorBoundary 도입**

- 컴포넌트에서 발생한 에러 관심사를 **부모 컴포넌트로(ErrorBoundary) 위임**
- 에러시 보여야 줘야 할 컴포넌트 할당

`Suspense`와 `ErrorBoundary`를 **`AsyncBoundary`**라는 하나의 컴포넌트로 **통합**


→ 비동기 `Suspense` 컴포넌트의 로딩 상태와 `Error` 상태를 동시에 처리하는 컴포넌트


 [https://www.slash.page/ko/libraries/react/async-boundary/src/withAsyncBoundary.i18n](https://www.slash.page/ko/libraries/react/async-boundary/src/withAsyncBoundary.i18n)



```
typescript
<AsyncBoundary
  pendingFallback={<RecommendLiveSkeleton />}
  rejectedFallback={(error) => <RecommendLiveError error={error} />}
>
  <RecommendLive />
</AsyncBoundary>

```


- 인자값
	- `pendingFallback` : 컴포넌트 로딩 시에 보여야할 컴포넌트
	- `rejectedFallback` : 에러시에 보여야할 컴포넌트
- 장점
	- 구현의 편리함
	- 추후에 `error`가 발생한 컴포넌트에서 독립적으로 `refetch` 가능
