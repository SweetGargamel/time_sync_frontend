# Time_Sync

TimeSync 是一款智能群体时间协调系统，专为解决多人日程匹配痛点而设计。系统通过算法自动化+大模型辅助实现用户便捷上传非空闲时间和群体时间交集计算，可帮助活动组织者在指定日期范围内快速定位最优时间段，从而极大的提高组织管理的效率。

本系统采用前沿的智能算法和大语言模型技术，能够智能解析各类日程文本，自动提取时间信息，并通过高效的群体时间匹配算法，为组织者提供最优的时间安排建议。系统支持多种数据导入方式，提供直观的可视化界面，让时间协调变得简单高效。无论是学术会议、社团活动还是课程安排，TimeSync 都能帮助您轻松找到最适合的时间段，让组织管理工作事半功倍。

> 注：稳定版代码在main分支，其他分支为测试分支

## RayNovate团队成员

| 姓名   | 学号      | 专业             | 书院     |
| ------ | --------- | ---------------- | -------- |
| 王浩宸 | 241220128 | 计算机科学与技术 | 开甲书院 |
| 陈新   | 241502026 | 信息与计算科学   | 开甲书院 |
| 胡恩齐 | 241880252 | 技术科学试验班   | 健雄书院 |
| 罗伟亮 | 241880396 | 技术科学试验班   | 健雄书院 |

> 按学号顺序排序

## 后端使用方法

> 见[backend](https://github.com/SweetGargamel/time_sync_frontend)

1. 克隆仓库到本地

2. 运行一下代码安装依赖

   ```bash
   pip install -r requirements.txt
   ```

3. 在`/time_sync`目录下新增一个配置文件`Config.py`，内容如下：

   ```python
   import os

   class Config:
       # Flask应用程序的密钥
       SECRET_KEY = os.environ.get('SECRET_KEY', 'dev')


       # 应用程序名称
       APP_NAME = os.environ.get('APP_NAME', 'Flask App')

       # SQLAlchemy配置
       SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI', 'postgresql://username:password@localhost/time_sync')


       SQLALCHEMY_TRACK_MODIFICATIONS = False

       index=0
       OPENAI_API_KEYS = ["sk-****286","sk-****701"] #替换为您的阿里云api key
       @staticmethod
       def get_key():
           Config.index+=1
           if Config.index>=len(Config.OPENAI_API_KEYS):
               Config.index=0
           return Config.OPENAI_API_KEYS[Config.index]
       OPENAI_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"
       #  阿里云智能体的apikey和id。我们在`route.py`里面用到了这个，用来处理query的信息。
       ALI_AGENT_APIKEY="sk-****f8f"
       ALI_AGENT_ID=''
       MODEL_NAME="qwen-plus-latest"
   ```

4. 安装PostgreSQL数据库，并创建一个数据库`time_sync`。你也可以用其他数据库，但需要修改`Config.py`中的数据库配置。

5. 因为安全原因，我们无法公开我们部署的阿里云的api_key，所以可能最后测试预定日程的时候无法调用ai返回的结果（会默认使用未经过大模型处理的结果）。您可以移步到我们已经部署的阿里云网站查看。

## 前端使用方法

> 见[frontend](https://github.com/SweetGargamel/time_sync_frontend)

1. 在本地安装node.js环境

2. `npm install`安装所有依赖

3. `npm run dev`启动本地服务器

4. 启动后端服务器

5. 最后打开 http://localhost:5173/ 即可本地查看页面

## 网站部署

您可以访问 http://47.122.85.137 来查看我们的已经部署好的网站。由于我们暂时只是测试阶段，允许所有人有修改人员和组信息，您可以做少量的删改的测试，但是请您不要把所有的人员信息都删除。

由于阿里云的限制，我们的服务器暂时不允许绑定域名。同时我们购买的阿里云配置有限，可能会出现大量访问时出现卡顿的情况。

## 时光织梦：代码里的温度韵脚

_算法是理性的诗行，而温度是它的韵脚：_

_当系统为熬夜科研的同学避开早八，那是代码在说"你值得休息"；_

_当界面为忙碌的教师自动推荐最佳时段，那是程序在道"你的时间很珍贵"；_

_当学长学姐的经验分享突破时间壁垒，是它在说 "传承的火花不应熄灭"；_

_当志愿服务的温暖如期抵达，是它在道 "善意值得最顺畅的旅程"；_

_当学术灵感在预定的时空畅快碰撞，是它在轻吟 "智慧的交响需要精准的节拍"；_

_当日历上亮起代表共识的绿色区块，那是技术在轻语"看，我们找到了相聚的答案"。_
<br />

_从教室到实验室，从行政楼到社团活动室，我们愿做无声的守护者——_

_不让任何一个人的声音因时间而沉默，_

_不让任何一次协作因繁琐而降温。_

_我们让错过的遗憾化作重逢的惊喜，_

_将零散的日程编织成紧密的联结。_
<br />

_最好的技术，_

_从来不是冰冷的01二进制，_

_而是能读懂你匆忙脚步下的期待，_

_能守护你珍贵时光里的每一度温暖。_

> ——By RayNovate Team
