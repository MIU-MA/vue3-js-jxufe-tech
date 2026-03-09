// 模拟数据库，这里存放所有新闻的数据
export const newsData = [
  {
    id: 'first', // 这是路由要用的唯一标识，URL 会变成 /news/first
    title: "数智&数模第一次联合授课",
    date: "2025年11月6日",
    cover: "/images/first.gif",
    intro: "  为了帮助协会的新同学们快速上手，打好编程与数据分析的基础，数智技术协会与数模协会决定强强联手，为大家带来干货满满的第一次联合授课！本次授课将聚焦于Python入门与开发环境配置，无论你是编程小白还是希望巩固基础，这都将是你的最佳起点。",
    // 详情页特有的复杂内容，您可以设计数据结构，或者直接存一段 HTML 字符串
    details: {
      time: "周六晚 19:00",
      location: "麦二教 2103",
      speaker: "数智 / 数模 会长"
    },
    // 如果内容结构差异很大，也可以直接放 HTML 内容
    contentHtml: `
    <div class="article-details-box">
        <h3>活动详情</h3>
        <ul>
            <li>
                <i class="fas fa-calendar-alt"></i>
                <span><strong>时间:</strong> 周六晚 19:00</span>
            </li>
            <li>
                <i class="fas fa-map-marker-alt"></i>
                <span><strong>地点:</strong> 麦二教 2103</span>
            </li>
             <li>
                <i class="fas fa-user"></i>
                <span><strong>主讲人:</strong> 数智 / 数模 会长</span>
            </li>
        </ul>
    </div>

    <div class="website-benefits">
        <h3 style="text-align:center; margin-bottom:30px;">授课内容</h3>
        <div class="benefits-grid">
            <div class="benefit-card">
                <div class="card-icon"><i class="fas fa-tools"></i></div>
                <h4>开发环境配置</h4>
                <p>深入了解Anaconda、Python和PyCharm的"三角恋"关系，学会配置高效的开发环境。掌握包管理、虚拟环境设置等实用技能。</p>
            </div>
            <div class="benefit-card">
                <div class="card-icon"><i class="fab fa-python"></i></div>
                <h4>Python基础入门</h4>
                <p>从零开始学习Python编程语言，掌握变量、数据类型、控制结构等基础知识。通过实践项目，快速建立编程思维。</p>
            </div>
        </div>
    </div>

    <div class="prerequisites">
        <h3>课前准备</h3>
        <p>以下为上课所需的准备工作（不用提前下载）：</p>
        <ul>
            <li><strong>必带:</strong> 个人笔记本电脑</li>
            <li><strong>Anaconda:</strong> <a href="https://mirrors.bfsu.edu.cn/anaconda/archive/" target="_blank">下载 (Python 3.x)</a></li>
            <li><strong>PyCharm:</strong> <a href="https://www.jetbrains.com/pycharm/download/" target="_blank">下载 (Community版)</a></li>
            <li><strong>辅助工具:</strong> <a href="https://docs.ocsjs.com/docs/app" target="_blank">OCS网课助手</a></li>
            <li>选带：充满求知欲的大脑和积极参与的心！</li>
        </ul>
    </div>

    <div class="conclusion">
        <p><strong>干货管饱！</strong></p>
        <p>数智&数模期待在周六晚上与你相遇，我们不见不散！</p>
    </div>
  `
  },
  {
    id: 'dzsm',
    title: "新生电子扫盲",
    date: "2025年9月28日",
    cover: null, // 如果没有封面图
    intro: "扫描下方二维码加入群聊...",
    contentHtml: `
      <div class="article-content" style="text-align:center;">
        <p>扫描下方二维码加入群聊</p>
        <img src="https://jxufe-acm.cn/images/px_code3.jpg" alt="社团群聊二维码" style="max-width: 300px;">
        <p>不许每天睡大觉</p>
      </div>
    `
  },
  // 未来只需在这里添加新对象即可，无需动代码
  {
    id: 'sj',
    title: "睡觉",
    date: "2025年10月10日",
    intro: "睡大觉。",
    contentHtml: `<p>这里是睡觉新闻的详细内容...</p>`
  }
];