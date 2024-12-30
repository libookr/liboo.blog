---
layout: post
current: post
cover: assets/images/writing.jpg
navigation: True
title: "[React-Query] useQuery속성 : Suspense"
date: 2024-12-01 12:51:00
tags:
    - [react-query, ]
class: post-template
subclass: 'post'
author: 홍창현
categories:
    - [트러블슈팅, ]
---
<br><br>

## 🚨 문제 상황


### `useQuery`에서 `Suspense`를 사용해야 하는 상황


## ✅ 문제 해결

- 기존의 코드


```
typescript
const defaultOptions: DefaultOptions = {
  queries: {
    retry: 3,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    suspense: true,
  }
};

export const queryClient = new QueryClient({
  defaultOptions
});

```



queries에 suspense값을 boolean으로 설정해주면 되었던 과거와 다르게 현재는 제공하지 않는 기능


`OmitKeyof`를 통해 빠져버린 `suspense`속성


![0](/upload/2024-12-01-[React-Query]_useQuery속성_:_Suspense.md/0.png)


### 새로 생긴 훅 **`useSuspenseQuery`** 는 suspense를 제공함



```
javascript
export const useMainLive = () => {
  return useSuspenseQuery<MainLive[], Error>({
    queryKey: ['mainLive'],
    queryFn: fetchMainLive,
    refetchOnWindowFocus: false,
  });
};

```



gpt나 블로그를 아무리 찾아도 알려주지 않았던 정보였다. 아마 최근에 바뀐 것 같다.


## 결론


**`useSuspenseQuery`** 훅을 사용하면 된다

