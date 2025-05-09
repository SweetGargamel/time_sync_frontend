<template>
  <div class="home-container">
    <div class="content-wrapper">
      <!-- 左侧内容 -->
      <div class="left-content">
        <el-card class="project-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <span class="italic-text">TimeSync</span>
                <span> For NJU</span>
              </span>
            </div>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="项目名称">
              <el-text style="color: #824082;">TimeSync</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="应用场景/行业">
              <el-text>校园行政管理</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="团队名称">
              <el-text>RayNovate</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="指导老师">
              <el-text>郭亚敏</el-text>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">团队成员</el-divider>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="王浩宸">
              <el-text>计算机科学与技术 - 项目总负责人，前端搭建</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="陈新">
              <el-text>信息与计算科学 - 时间统筹算法设计</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="罗伟亮">
              <el-text>技术科学试验班 - 后端搭建，数据库</el-text>
            </el-descriptions-item>
            <el-descriptions-item label="胡恩齐">
              <el-text>技术科学试验班 - 信息导入，文档撰写</el-text>
            </el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">系统介绍</el-divider>

          <el-card shadow="hover" class="intro-card">
            <el-text class="intro-text">
              TimeSync
              是一款智能群体时间协调系统，专为解决多人日程匹配痛点而设计。系统通过算法自动化+大模型辅助实现用户便捷上传非空闲时间和群体时间交集计算，可帮助活动组织者在指定日期范围内快速定位最优时间段，从而极大的提高组织管理的效率。
            </el-text>
            <el-text class="intro-text">
              本系统采用前沿的智能算法和大语言模型技术，能够智能解析各类日程文本，自动提取时间信息，并通过高效的群体时间匹配算法，为组织者提供最优的时间安排建议。系统支持多种数据导入方式，提供直观的可视化界面，让时间协调变得简单高效。无论是学术会议、社团活动还是课程安排，TimeSync
              都能帮助您轻松找到最适合的时间段，让组织管理工作事半功倍。
            </el-text>
          </el-card>
        </el-card>
      </div>

      <!-- 右侧诗歌 -->
      <div class="right-content">
        <el-card shadow="hover" class="poem-card">
          <div class="poem-content">
            <h3 class="poem-header">时光织梦：代码里的温度韵脚</h3>

            <p class="poem-line">算法是理性的诗行，而温度是它的韵脚：</p>
            <p class="poem-line">当系统为熬夜科研的同学避开早八，那是代码在说"你值得休息"；</p>
            <p class="poem-line">当界面为忙碌的教师自动推荐最佳时段，那是程序在道"你的时间很珍贵"；</p>
            <p class="poem-line">当学长学姐的经验分享突破时间壁垒，是它在说 "传承的火花不应熄灭"；</p>
            <p class="poem-line">当志愿服务的温暖如期抵达，是它在道 "善意值得最顺畅的旅程"；</p>
            <p class="poem-line">当学术灵感在预定的时空畅快碰撞，是它在轻吟 "智慧的交响需要精准的节拍"；</p>
            <p class="poem-line">当日历上亮起代表共识的绿色区块，那是技术在轻语"看，我们找到了相聚的答案"。</p>

            <p class="poem-line poem-spacing">从教室到实验室，从行政楼到社团活动室，我们愿做无声的守护者——</p>
            <p class="poem-line">不让任何一个人的声音因时间而沉默，</p>
            <p class="poem-line">不让任何一次协作因繁琐而降温。</p>
            <p class="poem-line">我们让错过的遗憾化作重逢的惊喜，</p>
            <p class="poem-line">将零散的日程编织成紧密的联结。</p>

            <p class="poem-line poem-spacing">最好的技术，</p>
            <p class="poem-line">从来不是冰冷的01二进制，</p>
            <p class="poem-line">而是能读懂你匆忙脚步下的期待，</p>
            <p class="poem-line">能守护你珍贵时光里的每一度温暖。</p>
            <p class="poem-line poem-signature">——By RayNovate Team</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.content-wrapper {
  display: flex;
  gap: 40px;
  justify-content: center;
  align-items: stretch;
}

.left-content {
  flex: 55;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.right-content {
  flex: 30;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.project-card,
.poem-card {
  height: 100%;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-descriptions {
  margin-top: 20px;
}

.el-divider {
  margin: 20px 0;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.italic-text {
  font-style: italic;
}

.intro-card {
  margin-top: 20px;
  background-color: #f8f9fa;
}

.intro-text {
  display: block;
  line-height: 1.8;
  margin-bottom: 15px;
  text-align: justify;
  color: #333;
}

.poem-content {
  padding: 20px;
  font-family: "楷体", KaiTi, "楷体_GB2312", STKaiti, serif;
}

.poem-line {
  line-height: 1.2;
  margin-top: 4px;
  margin-bottom: 4px;
  text-align: justify;
  color: #333;
}

.poem-spacing {
  margin-top: 30px;
}

.poem-header {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 10px;
  margin-top: 0px;
  color: #7a5c99;
}

.poem-signature {
  text-align: right;
  font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif;
  font-size: 1.1em;
  letter-spacing: 1px;
  font-style: italic;
  color: #7a5c99;
  margin-top: 18px;
}
</style>