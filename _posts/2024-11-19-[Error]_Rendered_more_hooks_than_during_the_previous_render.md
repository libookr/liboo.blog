---
layout: post
current: post
cover: "assets/images/writing.jpg"
navigation: True
title: "[Error] Rendered more hooks than during the previous render"
date: 2024-11-19 09:49:00
tags:
    - 
class: post-template
subclass: 'post'
author: 
  - "홍창현"
categories:
    - [트러블슈팅, ]
---

## Rendered more hooks than during the previous render


렌더링 이후에 훅이 선언되는 오류


커스텀 훅을 통해 가져온 데이터가 isLoading인 경우와 Error인경우를 나눠서 렌더링하고 그것이 아니라면 정상적인 컴포넌트들을 렌더링하도록 코드를 구현



```
typescript
const RecommendLive = () => {
  const navigate = useNavigate();
  const { data: randomLiveData, isLoading, error } = useRandomLive();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // const videoUrl = `https://kr.object.ncloudstorage.com/web22/live/${liveData.liveId}/index.m3u8`;
  const videoUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  if (error) {
    return <div>데이터를 가져오는 중 에러가 발생했습니다.</div>;
  }

  if (!randomLiveData || randomLiveData.length === 0) {
    return <div>추천 라이브 데이터가 없습니다.</div>;
  }

  const liveData = randomLiveData[0];
  
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement?.play();
      });

      return () => {
        hls.destroy();
      };
    } else if (videoElement) {
      videoElement.src = videoUrl;
      videoElement.play();
    }
  }, [videoUrl]);

  return (
    <RecommendLiveContainer>
      <RecommendLiveBox $isLoading={isLoading}>
        <video ref={videoRef} autoPlay muted />
      </RecommendLiveBox>
      <RecommendLiveWrapper onClick={() => navigate(`/live/${liveData.liveId}`)}>
        <RecommendLiveHeader>
          <div className="recommend_live_status">
            <LiveBadgeLarge />
            <span>{liveData.concurrentUserCount}명 시청</span>
          </div>
          <p className="recommend_live_title">{liveData.liveTitle}</p>
        </RecommendLiveHeader>

        <RecommendLiveInformation>
          <RecommendLiveProfile>
            <img src={sampleProfile} />
          </RecommendLiveProfile>
          <RecommendLiveArea>
            <span className="video_card_name">{liveData.channel.channelName}</span>
            <span className="video_card_category">{liveData.category}</span>
          </RecommendLiveArea>
        </RecommendLiveInformation>
      </RecommendLiveWrapper>
    </RecommendLiveContainer>
  );
};

```



위와 같은 경우 return으로 컴포넌트 렌더링을 한 후에 `useEffect`와 같은 훅이 실행되므로 오류가 발생함



```
typescript

const RecommendLive = () => {
  const navigate = useNavigate();
  const { data: randomLiveData, isLoading, error } = useRandomLive();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // const videoUrl = `https://kr.object.ncloudstorage.com/web22/live/${liveData.liveId}/index.m3u8`;
  const videoUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoElement?.play();
      });

      return () => {
        hls.destroy();
      };
    } else if (videoElement) {
      videoElement.src = videoUrl;
      videoElement.play();
    }
  }, [videoUrl]);

  if (error) {
    return <div>데이터를 가져오는 중 에러가 발생했습니다.</div>;
  }

  if (!randomLiveData || randomLiveData.length === 0) {
    return <div>추천 라이브 데이터가 없습니다.</div>;
  }

  const liveData = randomLiveData[0];
  console.log('liveData', liveData);

  return (
    <RecommendLiveContainer>
      <RecommendLiveBox $isLoading={isLoading}>
        <video ref={videoRef} autoPlay muted />
      </RecommendLiveBox>
      <RecommendLiveWrapper onClick={() => navigate(`/live/${liveData.liveId}`)}>
        <RecommendLiveHeader>
          <div className="recommend_live_status">
            <LiveBadgeLarge />
            <span>{liveData.concurrentUserCount}명 시청</span>
          </div>
          <p className="recommend_live_title">{liveData.liveTitle}</p>
        </RecommendLiveHeader>

        <RecommendLiveInformation>
          <RecommendLiveProfile>
            <img src={sampleProfile} />
          </RecommendLiveProfile>
          <RecommendLiveArea>
            <span className="video_card_name">{liveData.channel.channelName}</span>
            <span className="video_card_category">{liveData.category}</span>
          </RecommendLiveArea>
        </RecommendLiveInformation>
      </RecommendLiveWrapper>
    </RecommendLiveContainer>
  );
};

```



위와같이 최종단에 return문을 밖으로 빼면 해결


**참고자료**


[https://velog.io/@sinf/Rendered-more-hooks-than-during-the-previous-render](https://velog.io/@sinf/Rendered-more-hooks-than-during-the-previous-render)

