---
layout: post
current: post
cover: assets/images/writing.jpg
navigation: True
title: "외부의 사용자가 Object Storage에 접근하지 못하는 권한 제어"
date: 2024-11-08 12:01:00
tags:
    - 
class: post-template
subclass: 'post'
author: 
    - [김준서, ]
categories:
    - [트러블슈팅, ]
---
<br><br>

## 문제 상황


Ncloude의 Object Stroage를 사용하는 과정에 있어, 업로드 된 파일이 임의의 다른 유저가 다운로드하지 못하는 오류를 맞닥뜨렸다.


이 문서에서는 해당 오류를 맞이한 과정부터 시작해, 어떻게 해결했는지 서술해보고자 한다.


## 해결 과정


### 1. 업로드된 파일에 접근 할 시 Access Denine이 발생하는 문제


![0](/upload/2024-11-08-외부의_사용자가_Object_Storage에_접근하지_못하는_권한_제어.md/0.png)


HLS 스트림 데이터를 온라인 상에서 송수신하기 위해, 우선적으로 object storage의 bucket에 파일을 업로드했다.


외부의 사용자가 접근할 수 있도록 권한까지 공개로 설정한 뒤 다운로드 테스트를 위해 파일의 URL에 접속해보았다.


![1](/upload/2024-11-08-외부의_사용자가_Object_Storage에_접근하지_못하는_권한_제어.md/1.png)


그러자 위와 같은 결과를 반환하며 bucket에 올라가 있는 파일에는 접근을 할 수 없었다.


웹 브라우저를 통한 오류일까싶어 curl을 통해 cli 환경에서도 파일을 끌어왔지만 위와 동일한 에러만 발생할 뿐이었다.


이 문제는 bucket의 접근 제어 기능으로 발생한 문제였는데, bucket의 접근 제어 기능이란 해당 bucket에 접근할 수 있는 VPC, ACL을 작성해 정해진 네트워크에서만 bucket에 접근을 할 수 있도록 설정하는 기능이다.


문제가 발생하는 원인을 찾고 난 뒤 bucket의 접근 제어 기능을 비활성화 한 뒤 파일에 접근하니 정상적으로 다운로드가 되는 모습을 볼 수 있었다.


![2](/upload/2024-11-08-외부의_사용자가_Object_Storage에_접근하지_못하는_권한_제어.md/2.png)


![3](/upload/2024-11-08-외부의_사용자가_Object_Storage에_접근하지_못하는_권한_제어.md/3.png)


### 2. CORS 접근 오류


bucket에 올라간 파일에 대해 [https://livepush.io/hls-player/index.html](https://livepush.io/hls-player/index.html) 사이트에서 영상 플레이 테스트를 진행해보았다.


그러나 브라우저의 console에서는 지속적으로 cors 에러를 발생 시킨 채 파일들을 불러오지 못하는 문제가 발생했다.


cors는 서로 다른 호스트의 주소에서 리소스에 대한 요청을 막는 정책으로 후에 조금 더 자세하게 서술하고자 한다.


우선 이 cors 문제를 해결하기 위해 몇가지 솔루션을 찾아본 결과 bucket 자체의 cors 정책을 변경해서 cors 오류를 피할 수 있는 방법을 찾았다.

1. `aws configure`를 통해 object storage의 키와 region을 설정한다
	- object storage는 aws s3가 사용하는 대부분의 기능을 사용 가능
2. 다음의 내용을 파일로 작성해준다.

	
```
markdown
	// cors-config.json
	{
	    "CORSRules": [
	        {
	            "AllowedOrigins": ["*"],
	            "AllowedMethods": ["GET", "POST", "PUT"],
	            "AllowedHeaders": ["*"],
	            "ExposeHeaders": [],
	            "MaxAgeSeconds": 3000
	        }
	    ]
	}
	
```


3. `aws --endpoint-url=https://kr.object.ncloudstorage.com s3api put-bucket-cors --bucket {bucket_name} --cors-configuration filt://{config_경로}` 에서 { } 안을 환경에 맞게 설정한 뒤 위에서 작성한 config를 업로드 해준다.

위의 과정을 거치면 bucket으로 오는 GET, POST, PUT 요청에 대해 cors 검증 없이 데이터를 요청할 수 있다.


## 결론


그러나 이러한 cors, 접근 제어를 전부 풀어버리면 악의적인 유저의 접근으로 대량의 트래픽이 발생할 수 있으므로 좀 더 자세한 정책의 수정이 필요하다.

<details>
  <summary>추신</summary>


<CORSConfiguration>
<CORSRule>
<AllowedOrigin>[https://yourdomain.com](https://yourdomain.com/)</AllowedOrigin>
<AllowedMethod>GET</AllowedMethod>
<AllowedMethod>PUT</AllowedMethod>
<AllowedMethod>POST</AllowedMethod>
<AllowedMethod>DELETE</AllowedMethod>
<AllowedHeader>*</AllowedHeader>
<ExposeHeader>ETag</ExposeHeader>
<MaxAgeSeconds>3000</MaxAgeSeconds>
</CORSRule>
</CORSConfiguration>


추후에 도메인을 연결하면 Allowed Origin 에 [liboo.kr](http://liboo.kr/) 을 해놓으면 좋을 것 같습니다!



  </details>
