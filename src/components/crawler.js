import fs from 'fs/promises'
import open from 'open'
import { LoginCredential } from './nju/login.js'
import { getCourseRaw, getFirstWeekStart } from './nju/getcourse.js'

async function handleCaptcha(captchaContent) {
  // 保存验证码图片
  await fs.writeFile('captcha.jpeg', captchaContent)

  // 打开验证码图片
  await open('captcha.jpeg')

  // 等待用户输入验证码
  const readline = (await import('readline')).createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    readline.question('请输入验证码: ', (answer) => {
      readline.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  // 在这里输入你的用户名和密码
  const username = '241220128'
  const password = 'whc62558223--'

  try {
    // 登录获取凭证
    const credential = await LoginCredential.fromLogin(username, password, handleCaptcha)

    // 获取课程数据
    const courseData = await getCourseRaw(credential)

    // 解析原始数据
    const courseJson = JSON.parse(courseData)

    // 将数据以格式化的JSON形式保存到文件
    await fs.writeFile('course_data.json', JSON.stringify(courseJson, null, 4), 'utf-8')

    console.log('课程数据已保存到 course_data.json')

    // 创建精简版数据
    const simplifiedData = courseJson.datas.cxxszhxqkb.rows.map((course) => ({
      上课时间地点: course.ZCXQJCDD,
      课程名称: course.KCM,
      教室: course.JASMC,
      校区: course.XXXQDM_DISPLAY,
    }))

    // 保存精简版数据
    await fs.writeFile('simplified_courses.json', JSON.stringify(simplifiedData, null, 4), 'utf-8')
    console.log('精简版课程数据已保存到 simplified_courses.json')

    // 获取学期开始日期
    const semesterStart = await getFirstWeekStart(credential)
    console.log('学期开始日期:', semesterStart)
  } catch (error) {
    console.error('发生错误:', error.message)
  }
}

// 运行主程序
main()
