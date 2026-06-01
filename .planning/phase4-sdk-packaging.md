# Phase 4: Android 端 SDK 封装

## 目标

将 app 模块中的临时代码重构为独立 `:perception-sdk` 模块，使用 ContentProvider 自动初始化，方便其他 app 集成。

## 状态：待开始

## 设计方案

### 模块结构

```
ui-perception/perception-sdk/
  build.gradle
  src/main/
    AndroidManifest.xml
    java/com/hh/uiperception/sdk/
      PerceptionSdk.java                  -- 公开 API 入口
      PerceptionSdkInitProvider.java       -- ContentProvider 自动初始化
      PerceptionHttpServer.java            -- 从 app/portal/ 迁移
      CaptureHandler.java                  -- 从 app/portal/ 迁移
      ForegroundActivityTracker.java       -- 从 App.java 提取
      SdkConfig.java                       -- 配置（端口等）
```

### build.gradle

```groovy
plugins {
    id 'com.android.library'
}
android {
    namespace 'com.hh.uiperception.sdk'
    compileSdk 34
    defaultConfig { minSdk 24 }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_21
        targetCompatibility JavaVersion.VERSION_21
    }
}
dependencies {
    implementation project(':perception-core')
    implementation project(':native-plugin')
}
```

### ContentProvider 自动初始化

```xml
<provider
    android:name=".PerceptionSdkInitProvider"
    android:authorities="com.hh.uiperception.sdk.init"
    android:exported="false"
    android:initOrder="900" />
```

### 迁移步骤

1. 创建 perception-sdk 模块骨架
2. 将 `app/portal/PerceptionHttpServer.java` 迁移到 SDK
3. 将 `app/portal/CaptureHandler.java` 迁移到 SDK
4. 从 `App.java` 提取前台 Activity 追踪逻辑为 `ForegroundActivityTracker`
5. 创建 `PerceptionSdkInitProvider` 和 `PerceptionSdk`
6. 更新 `settings.gradle` 添加 `:perception-sdk`
7. 更新 `app/build.gradle` 添加 `implementation project(':perception-sdk')`
8. 删除 app 中的临时代码

## 任务清单

- [ ] 4.1 创建 perception-sdk 模块骨架
- [ ] 4.2 迁移 HTTP Server 和 CaptureHandler
- [ ] 4.3 实现 ForegroundActivityTracker
- [ ] 4.4 实现 ContentProvider 自动初始化
- [ ] 4.5 实现 PerceptionSdk 公开 API
- [ ] 4.6 更新 settings.gradle 和 app/build.gradle
- [ ] 4.7 清理 app 中的临时代码
- [ ] 4.8 验证：编译通过，功能不变

## 验证标准

1. `./gradlew :perception-sdk:assembleDebug` 编译通过
2. 集成到 app 后 ContentProvider 自动初始化
3. `curl http://localhost:9700/ping` 和 `/capture` 功能正常
4. app 模块中不再有临时的 portal 代码
