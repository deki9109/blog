---
title: "Kubernetes Gateway API 전환은 Ingress 교체보다 운영 역할 분리가 핵심이다"
date: "2026-09-07"
category: "Tech"
tags: ["Tech", "Kubernetes", "GatewayAPI", "Ingress", "PlatformEngineering"]
description: "Kubernetes Ingress는 freeze 상태이고 Gateway API가 더 풍부한 트래픽 라우팅 모델을 제공합니다. 전환의 핵심은 리소스 이름 변경이 아니라 플랫폼 팀과 앱 팀의 책임 경계를 명확히 나누는 것입니다."
---

Kubernetes에서 외부 트래픽을 서비스로 보내는 기본 선택지는 오랫동안 Ingress였습니다. 단순 HTTP 라우팅에는 여전히 유용하지만, 현대적인 플랫폼 운영에서는 한계가 자주 드러납니다. TLS, 여러 리스너, 여러 팀의 라우팅 소유권, 교차 네임스페이스 참조, 세밀한 정책 부착, gRPC 같은 프로토콜을 다루기 시작하면 Ingress 하나에 주석을 계속 붙이는 방식이 복잡해집니다.

Kubernetes 공식 문서는 Ingress가 freeze 상태라고 설명하며, 새 기능은 Gateway API에 추가되고 있다고 안내합니다. Gateway API는 Ingress를 단순히 이름만 바꾼 리소스가 아닙니다. 클러스터 인프라를 운영하는 팀과 애플리케이션 라우팅을 관리하는 팀의 책임을 리소스 모델로 나누려는 접근입니다.

![기존 Ingress 트래픽 경로가 Kubernetes Gateway API 구조로 전환되고 플랫폼 팀과 앱 팀의 운영 경계가 나뉘는 이미지](/images/2026-09-07-kubernetes-gateway-api-migration.png)

## Ingress는 단순해서 강했지만 확장에는 약했다

Ingress의 장점은 단순함입니다. 호스트와 경로를 지정하고, 백엔드 서비스로 연결하면 됩니다. 작은 서비스나 단일 팀 환경에서는 이 모델이 충분합니다. 문제는 조직과 트래픽 요구사항이 커질 때 시작됩니다.

현실의 Ingress 운영은 컨트롤러별 annotation에 크게 의존합니다. 리다이렉트, 타임아웃, 헤더 조작, TLS 옵션, 백엔드 프로토콜, 인증, canary 라우팅 같은 기능은 표준 필드보다 구현체별 확장에 묶이는 경우가 많습니다. 이 방식은 빠르게 문제를 해결할 수 있지만, 컨트롤러 변경이나 멀티클러스터 운영에서는 이전 비용을 키웁니다.

Ingress가 나쁘다는 뜻은 아닙니다. 이미 안정적으로 쓰고 있고 요구사항이 단순하다면 계속 운영할 수 있습니다. 다만 새 플랫폼을 설계하거나 여러 팀이 같은 클러스터에서 트래픽을 공유한다면 Gateway API를 기본 선택지로 검토하는 편이 합리적입니다.

## Gateway API는 역할을 리소스로 나눈다

Gateway API의 핵심 리소스는 GatewayClass, Gateway, Route 계열입니다. GatewayClass는 어떤 구현체가 게이트웨이를 제공하는지 나타냅니다. Gateway는 실제 리스너와 네트워크 진입점을 정의합니다. HTTPRoute, GRPCRoute 같은 Route 리소스는 애플리케이션 트래픽 규칙을 표현합니다.

이 구조는 역할 분리를 가능하게 합니다. 플랫폼 팀은 GatewayClass와 Gateway를 관리하며 인프라, 보안, 공용 리스너, 인증서 정책을 책임질 수 있습니다. 애플리케이션 팀은 자신이 소유한 네임스페이스에서 Route를 만들고 서비스로 연결합니다. 모든 팀이 같은 Ingress 컨트롤러 annotation을 직접 만지는 구조보다 운영 경계가 명확해집니다.

또한 Gateway API는 cross-namespace routing 같은 시나리오를 더 명시적으로 다룹니다. 공유 게이트웨이에 여러 팀의 Route를 붙일 수 있지만, 참조 허용과 정책을 통해 누가 무엇에 연결할 수 있는지 통제해야 합니다. 이는 멀티테넌트 클러스터에서 중요한 차이입니다.

![GatewayClass, Gateway, Route, 리스너, 백엔드 서비스, 정책 부착점이 계층적으로 연결된 Kubernetes Gateway API 리소스 구조 이미지](/images/2026-09-07-kubernetes-gateway-api-migration-sub.png)

## 마이그레이션은 컨트롤러 호환성부터 본다

Gateway API를 쓰려면 실제 컨트롤러가 필요합니다. 모든 기능이 모든 컨트롤러에서 동일하게 동작하는 것은 아닙니다. Kubernetes Gateway API 문서는 구현체별 지원 수준을 확인할 수 있게 안내합니다. 따라서 전환 전에는 현재 쓰는 Ingress 컨트롤러 또는 서비스 메시, 클라우드 로드밸런서가 어떤 Gateway API 리소스와 기능을 지원하는지 확인해야 합니다.

처음부터 모든 Ingress를 한 번에 바꾸는 방식은 위험합니다. 먼저 단순한 HTTPRoute부터 옮기고, TLS 종료, 리다이렉트, 헤더 정책, gRPC, canary, timeouts 같은 기능은 별도 테스트로 검증해야 합니다. 기존 annotation으로 해결하던 기능이 Gateway API 표준 필드로 이동 가능한지, 아니면 구현체별 확장이 필요한지 확인해야 합니다.

2026년에는 Ingress 리소스를 Gateway API 리소스로 변환하는 Ingress2Gateway 프로젝트도 1.0에 도달했습니다. 자동 변환은 출발점으로 유용하지만, 운영 정책까지 자동으로 설계해 주지는 않습니다. 변환 결과는 사람이 검토하고, 특히 보안·TLS·네임스페이스 참조·컨트롤러별 동작을 다시 확인해야 합니다.

## 운영 정책은 Gateway 주변에 붙어야 한다

Gateway API는 트래픽 라우팅 리소스만이 아니라 정책 부착의 기준점이 될 수 있습니다. TLS 설정, 인증서 관리, 허용 네임스페이스, 참조 정책, 라우팅 우선순위, 관측성, rate limit 같은 운영 관심사를 어디에 둘지 정해야 합니다.

중요한 원칙은 애플리케이션 팀이 필요한 자율성을 갖되, 공유 인프라를 깨뜨릴 수 없게 하는 것입니다. 앱 팀은 자신의 Route를 빠르게 배포할 수 있어야 합니다. 플랫폼 팀은 공용 Gateway, 인증서, 외부 노출 정책, 보안 제한을 통제해야 합니다. Gateway API는 이 협업 방식을 리소스 모델로 표현하기 좋은 기반입니다.

관측성도 함께 설계해야 합니다. Ingress에서 Gateway API로 옮기면 대시보드와 알림의 기준 리소스가 달라질 수 있습니다. 에러율, 지연 시간, TLS 오류, 라우팅 미스, 백엔드 연결 실패를 Gateway와 Route 단위로 볼 수 있어야 합니다. 전환 후 장애가 나면 어느 팀의 Route 변경인지, 어느 Gateway 정책 변경인지 빠르게 분리해야 합니다.

![Ingress에서 Gateway API로 트래픽을 단계적으로 옮기며 canary, TLS 정책, 관측성, 롤백을 점검하는 운영 마이그레이션 이미지](/images/2026-09-07-kubernetes-gateway-api-migration-sub2.png)

## 지금 확인할 체크리스트

첫째, 현재 Ingress annotation 사용 목록을 뽑습니다. 어떤 기능이 표준 Gateway API 필드로 옮겨질 수 있고, 어떤 기능은 구현체별 확장이 필요한지 분류해야 합니다. 둘째, 사용할 컨트롤러의 Gateway API 지원 수준을 확인합니다. HTTPRoute만 되는지, GRPCRoute와 TLS 옵션까지 되는지, 정책 확장은 어떤 방식인지 봐야 합니다.

셋째, 플랫폼 팀과 앱 팀의 소유권을 나눕니다. GatewayClass와 Gateway는 누가 만들고, Route는 누가 만들며, 네임스페이스 간 참조는 누가 승인하는지 정해야 합니다. 넷째, 작은 서비스부터 canary 방식으로 옮깁니다. 기존 Ingress와 Gateway API 경로를 동시에 운영하며 지연 시간, 에러율, TLS 오류를 비교합니다.

다섯째, 롤백 경로를 준비합니다. Gateway API 전환 중에는 DNS, 로드밸런서, 인증서, 라우팅 규칙이 함께 바뀔 수 있습니다. 문제가 생겼을 때 어떤 리소스를 되돌리면 되는지 사전에 문서화해야 합니다. 여섯째, Ingress2Gateway 같은 변환 도구는 초안 생성용으로 쓰고, 결과를 운영 정책 기준으로 검토합니다.

오늘 기준으로 정리하면 세 가지입니다.

1. Ingress는 freeze 상태이며 새 기능은 Gateway API 쪽으로 확장되고 있습니다.
2. Gateway API의 핵심 가치는 라우팅 기능보다 플랫폼 팀과 앱 팀의 책임 경계 분리입니다.
3. 전환은 자동 변환보다 컨트롤러 지원, 정책 부착, 관측성, 롤백 계획 검증이 중요합니다.

Gateway API 전환은 리소스 이름을 바꾸는 작업이 아닙니다. 트래픽 진입점, 팀 권한, 보안 정책, 관측성 기준을 다시 정리하는 플랫폼 작업입니다. 단순 서비스부터 시작해 기능 차이를 확인하고, 운영 경계를 명확히 만든 뒤 단계적으로 옮기는 방식이 가장 현실적입니다.

> 출처: [Kubernetes - Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)
> 출처: [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)
> 출처: [Kubernetes Gateway API - Implementations](https://gateway-api.sigs.k8s.io/implementations/)
> 출처: [Kubernetes Blog - Ingress2Gateway v1.0](https://kubernetes.io/blog/2026/06/02/ingress2gateway-v1-0/)
