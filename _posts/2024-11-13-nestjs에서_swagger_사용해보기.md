---
layout: post
current: post
cover: assets/images/writing.jpg
navigation: True
title: nestjs에서 swagger 사용해보기
date: 2024-11-13 11:34:00
tags:
    - 
class: post-template
subclass: 'post'
author: 김준서
categories:
    - [학습, ]
---
<br><br>

## 서론


앞으로 프 - 백 협업 작업을 함에 있어, 백엔드에서 발행되는 api의 명세는 프론트에 필수라고 생각합니다.


노션으로 api 명세를 작성해서 공유하는 방식도 있지만, 앞으로의 작업 효율을 위해 swagger를 사용해보고자 합니다.


## 본론


swagger은 API 문서 자동화 도구로써 api 명세를 공유하는데 많은 효율을 볼 수 있다.


또한 swagger를 통해 api까지 테스트 해 볼 수 있는 편리한 도구다.


yarn 환경에서 swagger를 설치하는 방법은 다음과 같다.



```
json
yarn add -D @nestjs/swagger swagger-ui-express

```



nestjs가 설치되어 있다는 환경에서 swagger는 간단한 setup 작업으로 손쉽게 사용할 수 있다.



```
javascript
// INestApplication은 NestJS의 NestFactory로 만들어진 app
export function setupSwagger(app: INestApplication): void {
	// Swagger 모듈 config builder
  const options = new DocumentBuilder()
    .setTitle('NestJS Study API Docs')
    .setDescription('NestJS Study API description')
    .setVersion('1.0.0')
    .build();

	// 위에서 만든 설정을 적용한 document를 /api-docs로 연결
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
}

```




```
typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupSwagger } from './util/swagger.js'; // 사전에 작성한 swagger setup

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app); // 인자로 app을 넣어주기만 하면 설정 끝
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


```



또한 nestjs에서 사용하는 swagger은 데코레이터를 통해 간단하게 api의 명세 설정이 가능하다.


자주 사용하는 데코레이터는 아래와 같으며, 더욱 자세한 내용은 nestjs 공식 문서에 나와있다.


[https://docs.nestjs.com/openapi/decorators](https://docs.nestjs.com/openapi/decorators)

- @ApiTags - Method / Controller
	- api에 tag를 달아준다.
	- controller에 tag를 달 경우 하위 api를 하나로 묶어서 표현해준다.
- @ApiOperation - Method
	- api에 설명을 추가한다.
	- 속성
		- summary - api 이름
		- description - api 설명
- @ApiResponse - Method / Controller
	- api의 반환 값에 대한 설명을 추가한다.
	- 기존에 정해져 있는 code들에 대한 데코레이터들이 별도로 존재 ( Ex. 201 - ApiCreatedResponse)
- @ApiProperty - Model
	- api dto에 대해 설명을 추가한다.

## 결론


이와 같이 swagger를 통해서 간단하게 프론트 - 백 간의 API 명세를 작성할 수 있다.


아직 처음 써보는 기능이라 데코레이터와 태그들이 익숙하지는 않지만 계속 사용해보면서 지속적으로 학습할 계획이다.


> 참고자료  
> [https://jhyeok.com/nestjs-swagger/](https://jhyeok.com/nestjs-swagger/)  
> [https://any-ting.tistory.com/122](https://any-ting.tistory.com/122)  
> [https://docs.nestjs.com/openapi/decorators](https://docs.nestjs.com/openapi/decorators)

