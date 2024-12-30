---
layout: post
current: post
cover: assets/images/writing.jpg
navigation: True
title: "[React-Query] useQuery속성 : onError"
date: 2024-12-01 04:08:00
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


### 잘못된 Id값으로 페이지를 접근하는 경우 채팅창을 포함한 모든 컴포넌트를 가려야 하는 상황


## 🏃 해결 과정


이를 해결하기 위해 `useQuery`에서 Error 핸들링을 하기로 결정


일단, ErrorBoundary를 활용하여 Error시 보여줘야할 컴포넌트 선정


### 1차 해결 과정


`onError`는 더이상 사용할 수 없는 속성

- **`throwOnError`** 사용


```
typescript
export const useClientLive = ({ liveId }: { liveId: string }) => {
  return useQuery<ClientLiveResponse, Error>({
    queryKey: ['clientLive'],
    queryFn: () => fetchLive({ liveId }),
    refetchOnWindowFocus: false,
    initialData: { info: {} as ClientLive },
    // onError는 더이상 제공하지 않음
    onError: (error: Error) => {
      // 에러코드
    },
    throwOnError: true,
  });
};

```



다시 생각해보니 `ClientView`에서 에러처리를 하는 것이 아닌 `ClientPage`에 접근하자마자 주소창의 `id`를 보고 유효한 `id`인지 판단하는 것이 옳은 것임을 판단


→ 기존의 `ErrorBoundary`를 삭제하고 `ErrorPage`로 라우팅 하도록 수정


### 2차 해결 과정

- `liveId` 값이 옳지 않은 값의 경우 에러

[image](https://prod-files-secure.s3.us-west-2.amazonaws.com/ccf16174-2ad8-4e34-8ea6-9046cc60f199/605ffe33-fd6e-4ec4-9622-58401e9e6cab/20241201-1644-35.2177938.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45FSPPWI6X%2F20241230%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20241230T161956Z&X-Amz-Expires=3600&X-Amz-Signature=a5f0edeccc99c5c3dafc1caeb4c48f06735c2038af7002972baacd8d1ef78f1a&X-Amz-SignedHeaders=host&x-id=GetObject)


영상에는 길게 담기지 않았지만, 결과를 받아오는데 까지 오랜 시간이 걸림


### query기본값 설정이 retry가 3



```
typescript
const defaultOptions: DefaultOptions = {
  queries: {
    retry: 3,
    refetchOnMount: true,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true
  }
};

```


- retry값을 0으로 수정


```
typescript
export const useClientLive = ({ liveId }: { liveId: string }) => {
  return useQuery<ClientLiveResponse, Error>({
    queryKey: ['clientLive'],
    queryFn: () => fetchLive({ liveId }),
    refetchOnWindowFocus: false,
    initialData: { info: {} as ClientLive },
    throwonError: true,
    retry: 0,
  });
};

```



## ✅ 문제 해결

- 고차함수를 사용해서 ClientPage를 감싸고 유효하지 않은 id를 기입 시에 errorPage로 이동


```
typescript
function ClientPageComponent() {
  return (
    <>
      <Header />
      <ClientContainer>
        <AsyncBoundary pendingFallback={<></>} rejectedFallback={() => <PlayerStreamError />}>
          <ClientView />
          <ClientChatRoom />
        </AsyncBoundary>
      </ClientContainer>
    </>
  );
}

const ClientPage = withLiveExistCheck(ClientPageComponent);

export default ClientPage;

```




```
typescript
export default function withLiveExistCheck<P extends object>(WrappedComponent: ComponentType<P>) {
  return function WithLiveExistCheckComponent(props: P) {
    const { id: liveId } = useParams();
    const navigate = useNavigate();

    const { data: isLiveExistData } = useCheckLiveExist({ liveId: liveId as string });
    const isLiveExist = isLiveExistData?.existed;

    useEffect(() => {
      if (!isLiveExist) {
        navigate('/error');
      }
    }, [isLiveExistData]);

    return <WrappedComponent {...props} />;
  };
}

```


