# 计算机科学 × AI 工程 × 模型研究 × 具身智能｜个人学习 Wiki

> **路线周期：18 个月主线 + 19–24 个月研究深化。** 以计算机基础与 AI 工程并重为起点，逐步增加机器学习、深度学习、LLM 原理与模型训练的比重；具身智能作为贯穿支线。

**使用方式**：这是一份单页 Wiki。所有阶段和资料均直接展开，不使用折叠卡片、隐藏页或切换标签。可以放进 Obsidian Vault，使用下方目录跳转；资料链接旁会写清楚来源。

## 快速目录
1. [第 1–3 个月｜编程基础与 AI 开发入门](#阶段1)
2. [第 4–6 个月｜计算机核心课程与 AI 工程](#阶段2)
3. [第 7–9 个月｜机器学习与数学基础](#阶段3)
4. [第 10–12 个月｜深度学习与 PyTorch](#阶段4)
5. [第 13–15 个月｜LLM 原理与模型训练](#阶段5)
6. [第 16–18 个月｜多模态与具身智能综合实践](#阶段6)
7. [第 19–24 个月（选修深化）｜从工程实践走向研究](#阶段7)
- [来源标注规则与核验清单](#来源标注规则与核验清单)
- [你提供的资源总索引](#你提供的资源总索引)
- [两本 PDF 的总阅读顺序](#两本-pdf-的总阅读顺序)

## 这条路线的四条主线

- **计算机基础**：Python/C → 数据结构与算法 → CSAPP → 操作系统 → 网络 → 数据库 → 软件工程。
- **AI 工程**：LLM API → Prompt/Context → RAG → Agent → Memory/Skills/MCP → 测试、部署与 Harness。
- **算法与模型**：数学 → 机器学习 → 深度学习 → PyTorch → Transformer → LLM 训练、微调与推理。
- **具身智能**：机器人认知 → 感知 → 运动学 → ROS 2/仿真 → 模仿学习 → VLA/World Model。

**执行节奏**：每周约 10–12 小时；第 1–6 个月大致分配为计算机基础 4h、AI 工程 4h、数学 2h、具身认知 1h、复盘 1h。每周最多 1 门主课程 + 1 个实践任务 + 1 条轻量支线。

## 来源标注规则

- **用户提供｜CSDIY**：你提供的 `https://csdiy.wiki/` 课程导航。CSDIY 中出现的课程会注明具体栏目；若我额外补了官方直达链接，会单独说明。
- **用户提供｜AI 课程清单 HTML**：你上传的《AI课程清单_分类与优先级(2).html》，其内容整理自你此前发来的 Datawhale 课程截图与链接。课程清单共 20 项，按原编号标注。
- **用户提供｜参考资源截图**：你此前发来的参考资源截图中出现 OpenCV、Pillow、Hugging Face Hub、ModelScope、B 站《动手学深度学习 PyTorch 版》、Stanford CNN 课程。若截图没有保留可复制 URL，会明确写“当前链接为补充入口”。
- **用户提供｜算法平台链接**：OI Wiki、QOJ、Codeforces 是你主动提供的链接。
- **用户提供｜PDF/飞书**：两本 PDF、PyOHPlus 飞书空间，以及沐曦 AI4S 的学习环境/指南链接均来自你提供的文件或链接。
- **用户个人项目**：`wdy-hh/vibe-coding-lab` 是你的个人项目，不标为 ChatGPT 推荐课程。
- **ChatGPT 推荐**：不在你提供的清单、截图、PDF 或链接中的课程/文档/工具；即使它托管在 Datawhale、GitHub 或其他平台，也不改变推荐来源。

> **重要区别**：来源标签说明“这项资料从哪里进入你的学习清单”，不等于网站托管方。比如一个课程可能托管在 GitHub，但若它来自你上传的课程清单，就标注“用户提供｜AI 课程清单 HTML”；如果是我后来补充的 Datawhale 仓库，就标注“ChatGPT 推荐”。

## 阶段1｜第 1–3 个月：编程基础与 AI 开发入门

**阶段定位**：从“会一点 C、Python 薄弱”走向能独立编写程序，并完成第一个 AI 应用。

**本阶段重点**：计算机基础 + AI 工程并行起步  
**投入建议**：每周约 10–12 小时

### 本阶段课程与资料

### 01｜Python 编程基础

- **学习时长**：3–5 周 · 约 18–25 小时
- **这份资料解决什么问题**：建立 Python 编程能力，为后续数据处理、机器学习、Agent 和模型训练做准备。
- **前置要求**：无；有 C 语言基础即可开始。
- **建议学习过程**：
  1. 按顺序学习变量、基本类型、条件与循环、函数、容器（list/dict/set/tuple）。
  2. 学习字符串处理、文件读写、异常处理、模块与包。
  3. 学习类与对象、迭代器、生成器、装饰器的基本用途；不必一开始钻研高级语法。
  4. 完成小练习：文本统计、CSV 读取与清洗、文件批量重命名、简单命令行工具。
  5. 用虚拟环境和 pip 管理依赖，学会运行脚本、阅读报错和调试。
- **最终产出**：一个 Python 小工具仓库，至少包含 3 个小程序、README、依赖说明和运行示例。
- **验收标准**：
  - 能够不照抄教程，独立写出函数并拆分模块。
  - 能读写 JSON、CSV 和普通文本文件。
  - 遇到 Traceback 能定位报错文件、行号和异常类型。
  - 能创建虚拟环境、安装依赖并在另一目录复现运行。
- **学习入口与逐项出处**：
  - [CS50P Python 入门](https://cs50.harvard.edu/python/2022/)
    - 来源：用户提供｜CSDIY「Python 语言」栏目列有 CS50P；课程直达链接由 ChatGPT 补充
  - [Python 官方教程](https://docs.python.org/3/tutorial/)
    - 来源：用户提供｜CSDIY「Python 语言」栏目列有 CS50P；课程直达链接由 ChatGPT 补充
- **本条路线归属**：用户提供｜CSDIY「Python 语言」栏目列有 CS50P；课程直达链接由 ChatGPT 补充

### 02｜MIT Missing Semester：命令行、Git 与开发工具

- **学习时长**：1–2 周 · 约 8–12 小时
- **这份资料解决什么问题**：建立可靠的开发工作流，不再依赖图形界面完成所有操作。
- **前置要求**：能够使用电脑和终端；可与 Python 同时进行。
- **建议学习过程**：
  1. 学习 Shell 基础：路径、目录、文件、管道、重定向、grep/find 等常用命令。
  2. 学习 Git 的工作区、暂存区、提交、分支、合并和冲突处理。
  3. 学习编辑器、调试器、环境变量、SSH 和基础自动化脚本。
  4. 给 Python 小工具建立 Git 仓库，练习小步提交、分支和回滚。
- **最终产出**：一个规范 Git 仓库：有 README、.gitignore、清晰提交记录和至少一个功能分支。
- **验收标准**：
  - 能从终端创建目录、查找文件、运行程序和查看进程。
  - 能解释 git status、add、commit、log、branch、merge 的作用。
  - 误操作后能通过 Git 找回之前版本。
- **学习入口与逐项出处**：
  - [MIT Missing Semester](https://missing.csail.mit.edu/)
    - 来源：用户提供｜CSDIY「编程入门」栏目列有 MIT Missing Semester
  - [Pro Git 中文版](https://git-scm.com/book/zh/v2)
    - 来源：用户提供｜CSDIY「编程入门」栏目列有 MIT Missing Semester
- **本条路线归属**：用户提供｜CSDIY「编程入门」栏目列有 MIT Missing Semester

### 03｜C 语言巩固与 CSAPP 并行学习

- **学习时长**：持续 3 个月；每周 1–2 小时
- **这份资料解决什么问题**：不放弃已有 C 语言基础，同时为理解内存、程序执行和操作系统建立直觉。
- **前置要求**：大学 C 语言课程；正在学习 CSAPP。
- **建议学习过程**：
  1. 复习指针、数组、字符串、结构体、函数指针和动态内存分配。
  2. 结合 CSAPP 当前进度理解程序如何从源代码变成可执行文件。
  3. 重点关注数据表示、汇编、链接、进程、虚拟内存等内容；按大学课程和作业进度推进。
  4. 每遇到一个系统概念，写一个最小 C 程序观察现象，而不是只背定义。
- **最终产出**：CSAPP 配套实验/小程序记录，至少整理 5 个“概念—实验—观察—解释”专题。
- **验收标准**：
  - 能解释指针与数组的区别、栈与堆的基本区别。
  - 能使用 gcc 编译、运行并排查简单错误。
  - 能把 CSAPP 中至少 5 个系统概念用自己的话讲清楚。
- **学习入口与逐项出处**：
  - [CSAPP 学习资源入口（CSDIY）](https://csdiy.wiki/)
    - 来源：用户提供｜CSDIY 课程导航中的对应栏目/课程条目
  - [CSAPP 课程配套资源](https://csapp.cs.cmu.edu/)
    - 来源：用户提供｜CSDIY「计算机系统基础」栏目列有 CMU 15-213 / CSAPP；你此前也持续学习 CSAPP
- **本条路线归属**：用户提供｜CSDIY「计算机系统基础」栏目列有 CMU 15-213 / CSAPP；你此前也持续学习 CSAPP

### 04｜LLM API 与第一个 AI 应用

- **学习时长**：2–3 周 · 约 12–18 小时
- **这份资料解决什么问题**：理解模型 API 的输入输出、鉴权、消息结构、流式响应和错误处理，做出可用应用。
- **前置要求**：Python 基础；会安装第三方库。
- **建议学习过程**：
  1. 理解 HTTP 请求、JSON、API Key、环境变量和常见状态码。
  2. 调用一个可用的大模型 API，完成普通对话和多轮消息。
  3. 增加流式输出、超时、重试、异常处理和日志。
  4. 将模型调用封装成独立模块，不把密钥写入代码或提交到 Git。
  5. 做一个简单的学习问答或资料总结界面；先追求完整闭环，不追求复杂功能。
- **最终产出**：AI 学习助手 0.1：可以输入问题、调用模型、显示结果，并安全管理 API Key。
- **验收标准**：
  - 能解释一次请求从客户端到 API 再返回的基本过程。
  - 断网、超时、无效 Key 时程序不会直接崩溃。
  - 密钥不出现在源码、日志和公开仓库中。
  - 能独立修改系统提示词和输出格式。
- **学习入口与逐项出处**：
  - [LLM Cookbook](https://github.com/datawhalechina/llm-cookbook)
    - 来源：ChatGPT 推荐｜LLM API 与 FastAPI 工程入门
  - [FastAPI 官方教程](https://fastapi.tiangolo.com/tutorial/)
    - 来源：ChatGPT 推荐｜LLM API 与 FastAPI 工程入门
- **本条路线归属**：ChatGPT 推荐｜LLM API 与 FastAPI 工程入门

### 05｜Easy-Vibe：AI 辅助开发工作流

- **学习时长**：贯穿第 1–3 个月
- **这份资料解决什么问题**：学会把 AI 编程工具当作开发协作者，而不是把代码理解和验证工作交给它。
- **前置要求**：有一个正在开发的个人项目；能够使用 Git。
- **建议学习过程**：
  1. 按你已开始的 Datawhale Easy-Vibe 课程推进，记录 AI IDE、Agent、Harness 等概念专题。
  2. 每次让 AI 写代码前，先写清楚需求、输入输出、约束和验收标准。
  3. 采用小步循环：理解任务 → 生成最小改动 → 本地运行 → 测试 → Code Review → 提交。
  4. 让 AI 解释关键代码、列出风险和测试方案；对关键逻辑自己追问并验证。
  5. 记录一次 AI 生成代码的失败案例，分析是需求、上下文、工具还是验证环节出了问题。
- **最终产出**：个人 Vibe Coding Lab：至少 2 个小项目、专题笔记和一份 AI 辅助开发工作流说明。
- **验收标准**：
  - 能把一个模糊需求拆成任务和验收条件。
  - 能审查 AI 改动并通过运行/测试验证，而不是只看起来合理。
  - 能解释 AI IDE、Agent、Harness 的基本职责边界。
- **学习入口与逐项出处**：
  - [Datawhale Easy-Vibe（课程入口）](https://github.com/datawhalechina/easy-vibe)
    - 来源：用户提供｜Datawhale Easy-Vibe（课程清单第 13 项及此前学习记录）
  - [你的 Vibe Coding Lab](https://github.com/wdy-hh/vibe-coding-lab)
    - 来源：用户个人项目｜Vibe Coding Lab
- **本条路线归属**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 13 项 Easy-Vibe；此前对话中你已开始学习该课程

### 06｜具身智能认知与传感器入门

- **学习时长**：每周约 1 小时；穿插进行
- **这份资料解决什么问题**：先建立机器人系统全貌，不急于训练模型或购买硬件。
- **前置要求**：无。
- **建议学习过程**：
  1. 认识机器人系统的组成：传感器、计算单元、执行器、通信和控制。
  2. 区分摄像头、深度相机、IMU、编码器、触觉传感器等设备分别测量什么。
  3. 了解移动机器人、机械臂、四足和人形机器人的任务差异。
  4. 阅读 VLA、World Model、ROS 2 的概览材料，建立术语表。
  5. 如有现成 ESP32/传感器套件，可选做读取传感器数据的小实验；没有设备则用公开数据或视频学习。
- **最终产出**：一张机器人系统组成图 + 20 个术语卡片 + 一篇“机器人如何感知和行动”短文。
- **验收标准**：
  - 能画出感知—决策—控制—执行—反馈闭环。
  - 能说明传感器与执行器的区别。
  - 能用自己的话解释 Embodied AI、VLA 和 ROS 2 是什么。
- **学习入口与逐项出处**：
  - [Every-Embodied](https://github.com/datawhalechina/every-embodied)
    - 来源：ChatGPT 推荐｜具身智能入门资源
  - [ROS 2 Tutorials](https://docs.ros.org/en/kilted/Tutorials.html)
    - 来源：ChatGPT 推荐｜具身智能入门资源
- **本条路线归属**：ChatGPT 推荐｜具身智能入门资源

#### 配套手册｜计算机基础科学与开发手册

**资料**：[北京大学计算机基础科学与开发手册 PDF](./北京大学计算机基础科学与开发手册-20250718%281%29%281%29.pdf)  
**出处**：用户上传 PDF。封面写明组织为北京大学信息科学技术学院、北京大学学生 Linux 俱乐部，作者臧炫懿，版本 250718。

- **本阶段读什么**：
  - 第一章《初步认识计算机》（印刷页 9–22）：建立硬件、软件、CPU、内存、外存和网络通信的最初认识。
  - 第二章《搜索和信息获取》（印刷页 23–27）：练习检索、官方文档、Wiki、论坛与信息平台的使用。
  - 第三章《初步使用计算机》（印刷页 29–34）：系统维护、终端初步、Git 初步。
  - 第五章《正式踏入编程世界》（印刷页 44–59）：语言、编程环境、IDE、编译器、运行程序、读报错和调试。
  - 附录 C《Python 高速入门》（印刷页 153–163）：配合 Python 主课快速查语法。
- **暂时跳过/按需**：第四章购买计算机；第六章 Markdown/LaTeX 可在开始写项目文档时查阅；附录 B C/C++ 只在需要补 C++ 时再读。
- **建议顺序**：第 1–3 周分散阅读，不要把整本手册当作一门必须从头刷完的课程。

#### 本阶段的最低验收
- 能独立写 Python 小程序，读懂常见报错，使用虚拟环境和 Git。
- 能调用一次 LLM API，并保护 API Key。
- 完成至少 2 个小项目，并把过程记录在自己的 Vibe Coding Lab。

#### CSDIY 课程导航中的相关课程

- **CS50P：Python 入门**：[CSDIY 课程条目](https://csdiy.wiki/编程入门/Python/CS50P/)。所在栏目：编程入门 → Python 语言。出处：用户提供｜CSDIY 导航。
- **MIT Missing Semester**：[CSDIY 课程条目](https://csdiy.wiki/编程入门/MIT-Missing-Semester/)。所在栏目：编程入门。出处：用户提供｜CSDIY 导航。

## 阶段2｜第 4–6 个月：计算机核心课程与 AI 工程

**阶段定位**：从能做 Demo 走向理解完整软件系统，掌握数据结构、系统、网络、数据库和 Agent 工程。

**本阶段重点**：计算机基础 + AI 工程双主线  
**投入建议**：每周约 10–12 小时

### 本阶段课程与资料

### 07｜数据结构与算法：MIT 6.006 选学

- **学习时长**：4–6 周 · 约 25–35 小时
- **这份资料解决什么问题**：掌握常见数据结构和算法分析，为后续系统与算法学习建立基础。
- **前置要求**：基本 Python 编程；离散数学基础有帮助。
- **建议学习过程**：
  1. 先学渐进复杂度：O(1)、O(log n)、O(n)、O(n log n)、O(n²)。
  2. 学习数组、链表、栈、队列、哈希表、树、堆和图的基本操作。
  3. 学习排序、二分查找、DFS/BFS、最短路径和动态规划入门。
  4. 每个结构先理解操作和复杂度，再手写一个简化实现。
  5. 每周做 3–5 道针对性练习，复盘错误原因，不追求刷题数量。
- **最终产出**：数据结构代码仓库 + 30 道精选题解 + 复杂度分析笔记。
- **验收标准**：
  - 能根据场景选择数组、哈希表、树或图。
  - 能分析常见操作的时间/空间复杂度。
  - 能不看答案实现 BFS、DFS、二分查找和基础排序。
- **学习入口与逐项出处**：
  - [MIT 6.006](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/)
    - 来源：用户提供｜CSDIY「数据结构与算法」栏目列有 MIT 6.006
  - [CSDIY 课程地图](https://csdiy.wiki/)
    - 来源：用户提供｜CSDIY 课程导航中的对应栏目/课程条目
- **本条路线归属**：用户提供｜CSDIY「数据结构与算法」栏目列有 MIT 6.006

### 08｜CSAPP：计算机系统主线

- **学习时长**：贯穿第 4–6 个月；持续推进
- **这份资料解决什么问题**：理解程序、机器、内存和进程之间的关系。
- **前置要求**：C 语言基础；阶段一已开始。
- **建议学习过程**：
  1. 按照当前教材进度推进，不重复从头学习。
  2. 重点整理数据表示、机器级程序、链接、异常控制流、虚拟内存和系统级 I/O。
  3. 遇到抽象概念时做小实验：查看汇编、运行 gdb、观察进程和内存行为。
  4. 完成课程/教材中与你当前进度匹配的实验与作业。
  5. 把系统知识和 AI 服务联系起来：进程、内存、文件、网络请求分别承担什么角色。
- **最终产出**：至少 3 个实验/作业 + 8 篇专题笔记 + 一张“程序运行时系统结构图”。
- **验收标准**：
  - 能解释程序从编译到链接再到运行的大致流程。
  - 能说明虚拟内存解决的问题及其基本机制。
  - 能解释进程、异常和系统调用的基本作用。
- **学习入口与逐项出处**：
  - [CSAPP 官网](https://csapp.cs.cmu.edu/)
    - 来源：用户提供｜CSDIY「计算机系统基础」栏目列有 CSAPP
  - [CSDIY](https://csdiy.wiki/)
    - 来源：用户提供｜CSDIY 课程导航中的对应栏目/课程条目
- **本条路线归属**：用户提供｜CSDIY「计算机系统基础」栏目列有 CSAPP

### 09｜操作系统：OSTEP 或 MIT 6.1810 二选一

- **学习时长**：4–6 周 · 约 25–35 小时
- **这份资料解决什么问题**：理解操作系统如何管理 CPU、内存、并发和持久化。
- **前置要求**：C 语言、进程和虚拟内存初步概念。
- **建议学习过程**：
  1. 先学习进程、系统调用、进程状态和上下文切换。
  2. 学习线程、锁、条件变量和并发问题。
  3. 学习虚拟内存、分页、地址空间和内存分配。
  4. 学习文件系统、文件描述符和 I/O。
  5. 通过小实验观察进程、线程、内存和文件行为；不要求一开始完整实现操作系统。
- **最终产出**：操作系统实验记录：进程/线程实验、同步实验、内存或文件系统实验至少各一项。
- **验收标准**：
  - 能解释进程与线程的区别。
  - 能描述虚拟内存、分页和页表的基本作用。
  - 能解释竞态条件、互斥锁和死锁的基本概念。
- **学习入口与逐项出处**：
  - [OSTEP 免费教材](https://pages.cs.wisc.edu/~remzi/OSTEP/)
    - 来源：用户提供｜CSDIY「操作系统」栏目列有 MIT 6.1810；OSTEP 是 ChatGPT 补充的替代教材
  - [MIT 6.1810](https://pdos.csail.mit.edu/6.1810/)
    - 来源：用户提供｜CSDIY「操作系统」栏目列有 MIT 6.1810；OSTEP 是 ChatGPT 补充的替代教材
- **本条路线归属**：用户提供｜CSDIY「操作系统」栏目列有 MIT 6.1810；OSTEP 是 ChatGPT 补充的替代教材

### 10｜计算机网络与 HTTP 基础

- **学习时长**：2–3 周 · 约 12–18 小时
- **这份资料解决什么问题**：理解客户端、服务器、网络协议和 API 通信。
- **前置要求**：Python API 实践；了解 IP 地址和端口即可。
- **建议学习过程**：
  1. 学习分层思想、IP、端口、TCP/UDP 和 DNS。
  2. 学习 HTTP 请求/响应、方法、状态码、Header、Cookie 和 TLS 基本概念。
  3. 用 curl、浏览器开发者工具观察真实请求。
  4. 解释一次 LLM API 调用经过哪些网络环节。
- **最终产出**：一个 HTTP API 调试实验记录 + 网络请求流程图。
- **验收标准**：
  - 能区分 IP 地址、端口、域名和 URL。
  - 能解释 TCP 与 UDP 的主要差异。
  - 能阅读一次 HTTP 请求和响应。
- **学习入口与逐项出处**：
  - [Computer Networking: A Top-Down Approach 资源入口](https://csdiy.wiki/)
    - 来源：用户提供｜CSDIY 课程导航中的对应栏目/课程条目
  - [MDN HTTP](https://developer.mozilla.org/zh-CN/docs/Web/HTTP)
    - 来源：用户提供｜CSDIY「计算机网络」栏目列有计算机网络课程；MDN 是 ChatGPT 补充的查阅入口
- **本条路线归属**：用户提供｜CSDIY「计算机网络」栏目列有计算机网络课程；MDN 是 ChatGPT 补充的查阅入口

### 11｜数据库与 SQL 基础

- **学习时长**：2–3 周 · 约 12–18 小时
- **这份资料解决什么问题**：能为 AI 应用设计基本数据表并安全读写数据。
- **前置要求**：Python 基础。
- **建议学习过程**：
  1. 学习关系表、主键、外键、约束和基本范式概念。
  2. 练习 SELECT、WHERE、JOIN、GROUP BY、INSERT、UPDATE、DELETE。
  3. 理解索引、事务和 ACID 的基本意义。
  4. 在 AI 学习助手中保存用户、会话和消息记录。
  5. 后续再根据兴趣选择 CMU 15-445，不必在此阶段深入数据库内核。
- **最终产出**：一个使用 SQLite 或 PostgreSQL 的小应用，包含表结构、初始化脚本和查询示例。
- **验收标准**：
  - 能独立设计 3–4 张相关表。
  - 能写多表 JOIN 和聚合查询。
  - 能解释索引和事务为什么有用。
- **学习入口与逐项出处**：
  - [SQLBolt](https://sqlbolt.com/)
    - 来源：用户提供｜CSDIY「数据库系统」栏目列有 CMU 15-445；SQLBolt 是 ChatGPT 补充的轻量练习入口
  - [CMU 15-445（进阶）](https://15445.courses.cs.cmu.edu/)
    - 来源：用户提供｜CSDIY「数据库系统」栏目列有 CMU 15-445；SQLBolt 是 ChatGPT 补充的轻量练习入口
- **本条路线归属**：用户提供｜CSDIY「数据库系统」栏目列有 CMU 15-445；SQLBolt 是 ChatGPT 补充的轻量练习入口

### 12｜FastAPI、测试与软件工程基础

- **学习时长**：2–3 周 · 约 15–20 小时
- **这份资料解决什么问题**：把单文件 Demo 组织成可维护、可测试的后端服务。
- **前置要求**：Python、HTTP 和 Git 基础。
- **建议学习过程**：
  1. 学习 FastAPI 路由、请求体、响应模型、依赖注入和自动 API 文档。
  2. 按模块拆分路由、业务逻辑、数据访问和模型调用。
  3. 学习 pytest，给核心函数和 API 写测试。
  4. 使用环境变量管理配置，增加日志、异常处理和输入校验。
  5. 了解 Docker 的用途，可选做容器化，不要求此阶段深入运维。
- **最终产出**：AI 学习助手 1.0 后端：模块化、带数据库、自动 API 文档和测试。
- **验收标准**：
  - 能从干净环境按 README 启动项目。
  - 核心接口有自动化测试。
  - 密钥、配置和业务逻辑分离。
  - 能解释项目目录结构和一次请求的调用链。
- **学习入口与逐项出处**：
  - [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
    - 来源：ChatGPT 推荐｜FastAPI 与 pytest 工程实践
  - [pytest 文档](https://docs.pytest.org/)
    - 来源：ChatGPT 推荐｜FastAPI 与 pytest 工程实践
- **本条路线归属**：ChatGPT 推荐｜FastAPI 与 pytest 工程实践

### 13｜RAG：All-in-RAG

- **学习时长**：3–4 周 · 约 18–25 小时
- **这份资料解决什么问题**：理解检索增强生成的完整数据链路和评估方法。
- **前置要求**：Python、API、数据库基本概念。
- **建议学习过程**：
  1. 先建立 RAG 全流程图：文档解析—切分—Embedding—索引—检索—重排—生成。
  2. 学习文档清洗、Chunking、Embedding 和向量检索。
  3. 实现基础检索，再尝试关键词检索与混合检索。
  4. 加入 Rerank、引用来源和拒答机制。
  5. 构建 20–30 条问题集，检查召回是否找到正确材料、回答是否忠实于材料。
- **最终产出**：个人课程资料知识库，支持文件导入、检索、回答和来源引用。
- **验收标准**：
  - 能画出 RAG 数据流并解释每一步。
  - 能比较不同切分策略或检索方法。
  - 能用测试集分析召回错误与生成错误。
  - 回答能够展示来源，资料中没有答案时能说明。
- **学习入口与逐项出处**：
  - [All-in-RAG](https://github.com/datawhalechina/all-in-rag)
    - 来源：用户提供｜上传的 AI 课程清单 HTML
- **本条路线归属**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 10 项 All-in-RAG

### 14｜Agent 基础：Hello-Agents

- **学习时长**：3–4 周 · 约 18–25 小时
- **这份资料解决什么问题**：理解 Agent Loop、工具调用、规划和反馈，而不只是调用某个框架。
- **前置要求**：LLM API、Python、RAG 基础。
- **建议学习过程**：
  1. 先自己画出最小 Agent Loop：观察/输入—模型决策—工具执行—结果回传—继续或结束。
  2. 学习 ReAct、Tool Use、结构化参数、Planning 和 Reflection。
  3. 先手写一个最小 Agent，再使用框架实现相同任务。
  4. 给工具增加参数校验、超时、权限限制和失败处理。
  5. 比较直接 LLM、工作流和 Agent 适合解决什么问题。
- **最终产出**：一个能调用至少 3 种工具、执行多步骤任务并记录轨迹的 Research Agent。
- **验收标准**：
  - 能解释 Agent Loop 每一步的输入输出。
  - 工具参数错误、工具超时和模型输出异常均有处理。
  - 能说明何时不应该使用 Agent，而应使用确定性工作流。
- **学习入口与逐项出处**：
  - [Hello-Agents](https://github.com/datawhalechina/hello-agents)
    - 来源：用户提供｜上传的 AI 课程清单 HTML
- **本条路线归属**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 8 项 Hello-Agents 入门

### 15｜Memory、Skills、MCP 与复杂 Agent 概览

- **学习时长**：2–3 周 · 约 12–18 小时
- **这份资料解决什么问题**：理解 Agent 的上下文、工具生态和可复用能力如何组织。
- **前置要求**：已完成最小 Agent。
- **建议学习过程**：
  1. 学习短期上下文、对话历史、长期记忆和外部知识库的区别。
  2. 学习 Skills 的任务说明、资源和执行约束；实现一个可复用技能。
  3. 学习 MCP 的 Host、Client、Server 和工具/资源暴露方式。
  4. 认识 Subagent、Multi-Agent 的分工、通信和协调成本。
  5. 把权限、日志、重试、沙箱、上下文压缩和评估纳入 Harness 视角。
- **最终产出**：给 Research Agent 增加一个 Skill、一个 MCP Server 和基础会话记忆；写架构对比文档。
- **验收标准**：
  - 能区分 RAG、Memory 和 Context。
  - 能解释 MCP 三个核心角色及一次工具调用流程。
  - 能判断多 Agent 是否真的比单 Agent 有优势。
  - 能列出 Harness 至少 5 项可靠性/安全设计。
- **学习入口与逐项出处**：
  - [Easy Data × AI（资源入口）](https://github.com/datawhalechina/easy-data-x-ai)
    - 来源：用户提供｜上传的 AI 课程清单 HTML
  - [MCP 官方文档](https://modelcontextprotocol.io/introduction)
    - 来源：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 7 项 Easy Data × AI；MCP 官方文档为 ChatGPT 补充
- **本条路线归属**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 7 项 Easy Data × AI；MCP 官方文档为 ChatGPT 补充

### 16｜AI Research Agent 1.0

- **学习时长**：贯穿第 5–6 个月 · 约 20–30 小时
- **这份资料解决什么问题**：把 API、数据库、RAG、Agent、工具和测试组合成完整软件项目。
- **前置要求**：完成本阶段主要课程。
- **建议学习过程**：
  1. 写一页需求文档：目标用户、核心任务、输入输出和不做什么。
  2. 设计模块：前端/接口、Agent Loop、工具层、知识库、记忆、数据存储。
  3. 先做最小闭环，再逐项增加 RAG、工具、日志和异常处理。
  4. 建立至少 20 个测试任务，记录成功率、失败类型、平均耗时和成本。
  5. 写部署说明、架构图和已知限制。
- **最终产出**：可运行的 GitHub 项目、README、架构图、测试集、评测报告和演示视频。
- **验收标准**：
  - 陌生人按 README 能运行。
  - 20 个测试任务有结果记录，不隐瞒失败。
  - 能够解释每个模块为什么存在、数据如何流动。
  - 发生工具失败或检索无结果时系统有合理反馈。
- **学习入口与逐项出处**：
  - [你的 Vibe Coding Lab](https://github.com/wdy-hh/vibe-coding-lab)
    - 来源：用户个人项目｜Vibe Coding Lab
- **本条路线归属**：用户个人项目｜wdy-hh/vibe-coding-lab；项目任务与验收标准由 ChatGPT 帮你规划

### 17｜ROS 2 基础认知与通信实验

- **学习时长**：每周约 1 小时；本阶段选做实践
- **这份资料解决什么问题**：理解机器人软件组件如何通信，为后续机器人项目做准备。
- **前置要求**：Python、Linux 命令行基础。
- **建议学习过程**：
  1. 理解 Node、Topic、Service、Action 的区别。
  2. 按官方教程安装与运行最小 Talker/Listener 示例（环境合适时）。
  3. 观察消息类型、发布订阅和节点关系。
  4. 了解 TF 坐标变换和 rosbag 数据记录的用途。
- **最终产出**：ROS 2 通信示意图 + 至少一个 Talker/Listener 实验记录；若环境不便，提交概念图与教程复现笔记。
- **验收标准**：
  - 能解释 Topic、Service、Action 各自适合什么任务。
  - 能运行或完整说明一个最小节点通信案例。
  - 能解释 TF 为什么需要统一坐标关系。
- **学习入口与逐项出处**：
  - [ROS 2 Tutorials](https://docs.ros.org/en/kilted/Tutorials.html)
    - 来源：ChatGPT 推荐｜ROS 2 官方教程
- **本条路线归属**：ChatGPT 推荐｜ROS 2 官方教程

#### 配套手册｜计算机基础科学与开发手册（开发与系统部分）

**继续阅读**：
- 第七章《计算机进阶》（印刷页 78–92）：Git 分支、标签、远程仓库、GitHub、SSH、文件管理与自动化。
- 第八章《开玩 Linux》（印刷页 93–101）：Linux 获取、基本操作、文件系统、权限和软件安装。
- 第九章《实用主义编程》（印刷页 103–110）：代码风格、防御式编程、日志和常见架构。
- 第十章《调试、测试和部署》（印刷页 111–117）：调试器、故障定位、单元测试、集成测试。
- 附录 A《迷你 ICS》（印刷页 119–126）：整数/浮点数表示、编译与链接、虚拟内存、缓存和系统调用，可作为 CSAPP 的轻量补充。
- 附录 B《C/C++ 高速入门》（印刷页 127–152）：只在需要补 C++ 时选读。

**出处**：用户上传 PDF《北京大学计算机基础科学与开发手册》。

#### 算法练习平台（你提供的辅助资源）

这些平台不是主线课程，而是配合数据结构与算法学习使用。建议先学一个知识点，再用 1–2 道题验证；不要把竞赛排名变成当前主目标。

**OI Wiki**
- 简介：算法与数据结构知识百科，覆盖语言基础、算法、数据结构、图论、数学、计算几何等。它是查阅型 Wiki，不是需要从头到尾看完的课程。
- 链接：[OI Wiki](https://oi-wiki.org/)
- 出处：用户提供｜你提供的 OI Wiki 链接

**QOJ**
- 简介：在线评测与竞赛平台，用来提交题目、验证算法实现并参与训练赛。
- 链接：[QOJ](https://qoj.ac/)
- 出处：用户提供｜你提供的 QOJ 链接

**Codeforces Problemset**
- 简介：按标签和难度练习算法题；先用它巩固基础实现，不要过早追 Rating。
- 链接：[Codeforces Problemset](https://codeforces.com/problemset)
- 出处：用户提供｜你提供的 Codeforces 链接

**Codeforces Contests**
- 简介：用于后续参加 Div.3 / Educational Round 或 Virtual Participation，训练限时分析与实现。
- 链接：[Codeforces Contests](https://codeforces.com/contests)
- 出处：用户提供｜你提供的 Codeforces 链接

#### 来自你上传的 Datawhale 课程清单的补充资源

### Datawhale 补充资源｜DeepAgents in Action：从零构建生产级 Agent

- **简介**：基于 LangChain 生态理解复杂任务拆解、持续调用工具和自主推进工作的智能体，并通过代码实验构建更可靠、可调试、可用于真实项目的 Agent。
- **适合对象**：具备 Python 基础、希望构建复杂 Agent 工程的开发者。
- **建议时机**：建议先完成 Agent 入门，并掌握基本工具调用和上下文管理。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/deepagents-in-action)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 6 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜Hello-Agents 进阶篇：构建智能体框架

- **简介**：在入门基础上学习智能体经典范式、HelloAgents 框架基础搭建、记忆与 RAG 系统、上下文工程、终端能力、MCP Server 和综合案例。
- **适合对象**：希望构建智能体框架、掌握框架二次开发能力的学习者。
- **建议时机**：与入门篇共用仓库；建议先学入门篇。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/hello-agents)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 9 项（课程清单中的 Datawhale 课程/项目条目）。

#### 本阶段的最低验收
- 能解释程序从源码到运行的大致过程，理解进程、内存、文件、网络和数据库的基本作用。
- 能做出一个带数据库、RAG、Agent、日志和测试的 Research Agent。
- 算法练习以理解数据结构与复杂度为目标，不以竞赛 Rating 为目标。

#### CSDIY 课程导航中的相关课程

- **MIT 6.006 Introduction to Algorithms**：[CSDIY 课程条目](https://csdiy.wiki/数据结构与算法/6.006/)。所在栏目：数据结构与算法。出处：用户提供｜CSDIY 导航。
- **CSAPP / CMU 15-213**：[CSDIY 课程条目](https://csdiy.wiki/计算机系统基础/CSAPP/)。所在栏目：计算机系统基础。出处：用户提供｜CSDIY 导航。
- **MIT 6.1810 Operating System Engineering**：[CSDIY 课程条目](https://csdiy.wiki/操作系统/MIT6.S081/)。所在栏目：操作系统。出处：用户提供｜CSDIY 导航。
- **Stanford CS144 Computer Network**：[CSDIY 课程条目](https://csdiy.wiki/计算机网络/CS144/)。所在栏目：计算机网络。出处：用户提供｜CSDIY 导航。
- **CMU 15-445 Database Systems**：[CSDIY 课程条目](https://csdiy.wiki/数据库/15445/)。所在栏目：数据库系统。出处：用户提供｜CSDIY 导航。

## 阶段3｜第 7–9 个月：机器学习与数学基础

**阶段定位**：从“会调用模型”走向理解算法、损失函数、优化和模型评估。

**本阶段重点**：算法基础加强；系统与工程保持低频维护  
**投入建议**：每周约 10–12 小时

### 本阶段课程与资料

### 18｜面向机器学习的数学复习

- **学习时长**：贯穿 3 个月 · 每周 2 小时
- **这份资料解决什么问题**：把大学数学知识转化为理解机器学习的工具。
- **前置要求**：已学线性代数、概率论、微积分或数值分析课程。
- **建议学习过程**：
  1. 线性代数：向量、矩阵乘法、线性变换、特征值、特征向量、正交与投影。
  2. 微积分：导数、偏导数、链式法则、梯度和多元函数极值。
  3. 概率统计：条件概率、常见分布、期望、方差、最大似然估计。
  4. 数值分析：迭代、误差、数值稳定性与优化的联系。
  5. 每学一个数学概念，找一个机器学习场景解释它为什么出现。
- **最终产出**：一份“机器学习数学工具箱”笔记，至少包含 12 个概念、公式、直觉、例子和应用场景。
- **验收标准**：
  - 能手算简单线性回归梯度。
  - 能解释最大似然与交叉熵的联系。
  - 能说明 PCA 为什么与特征值/特征向量有关。
  - 能用链式法则解释反向传播的基础思想。
- **学习入口与逐项出处**：
  - [3Blue1Brown 线性代数](https://www.3blue1brown.com/topics/linear-algebra)
    - 来源：用户提供｜上传的《人工智能基础知识手册》第一章；3Blue1Brown 与 Khan Academy 是 ChatGPT 补充
  - [Khan Academy 微积分/概率](https://www.khanacademy.org/)
    - 来源：用户提供｜上传的《人工智能基础知识手册》第一章；3Blue1Brown 与 Khan Academy 是 ChatGPT 补充
- **本条路线归属**：用户提供｜上传的《人工智能基础知识手册》第一章；3Blue1Brown 与 Khan Academy 是 ChatGPT 补充

### 19｜Andrew Ng Machine Learning Specialization

- **学习时长**：6–8 周 · 约 35–50 小时
- **这份资料解决什么问题**：系统掌握监督学习、无监督学习、模型评估和基本优化。
- **前置要求**：Python、NumPy 基础；数学工具箱同步补充。
- **建议学习过程**：
  1. 学习线性回归、逻辑回归和损失函数。
  2. 学习梯度下降、特征缩放、过拟合和正则化。
  3. 学习决策树、集成方法和模型选择。
  4. 学习聚类、异常检测和推荐系统基础。
  5. 每个模块完成课程练习，并用自己的数据或公开数据复做一遍。
- **最终产出**：至少 3 个机器学习实验：回归、分类、聚类；每个包含数据处理、训练、评估和误差分析。
- **验收标准**：
  - 能解释模型假设、损失函数和训练目标。
  - 能区分训练集、验证集和测试集。
  - 能解释过拟合、欠拟合和数据泄漏。
  - 能根据指标选择模型，而非只报告准确率。
- **学习入口与逐项出处**：
  - [Machine Learning Specialization](https://www.coursera.org/specializations/machine-learning-introduction)
    - 来源：用户提供｜CSDIY「机器学习」栏目列有 Coursera Machine Learning；具体课程版本与学习安排由 ChatGPT 选择
- **本条路线归属**：用户提供｜CSDIY「机器学习」栏目列有 Coursera Machine Learning；具体课程版本与学习安排由 ChatGPT 选择

### 20｜南瓜书：机器学习公式与推导补充

- **学习时长**：与课程同步 · 选读重点章节
- **这份资料解决什么问题**：针对不理解的公式补充推导，不把教材变成第二门重复课程。
- **前置要求**：正在学习机器学习课程。
- **建议学习过程**：
  1. 按当前课程进度查阅对应章节，而不是从头到尾逐字阅读。
  2. 对线性回归、逻辑回归、决策树、SVM、PCA 等重点公式做推导。
  3. 每个公式都写出符号含义、目标函数、推导关键步骤和适用条件。
  4. 遇到推导困难时，先用简单二维例子验证直觉。
- **最终产出**：精选公式推导笔记，至少 8 个核心公式。
- **验收标准**：
  - 能够从目标函数解释公式来源。
  - 能说清公式中的变量、假设和适用范围。
  - 能够用一个小例子验证公式含义。
- **学习入口与逐项出处**：
  - [机器学习公式详解（南瓜书）](https://github.com/datawhalechina/pumpkin-book)
    - 来源：ChatGPT 推荐｜Datawhale 南瓜书（不在你上传的 20 项课程清单中）
- **本条路线归属**：ChatGPT 推荐｜Datawhale 南瓜书（不在你上传的 20 项课程清单中）

### 21｜NumPy、Pandas 与 Scikit-learn 实践

- **学习时长**：2–3 周 · 约 12–18 小时
- **这份资料解决什么问题**：建立可复用的数据处理与传统机器学习实验能力。
- **前置要求**：Python 基础；同步学习机器学习。
- **建议学习过程**：
  1. 使用 NumPy 操作数组、广播、矩阵乘法和随机数。
  2. 使用 Pandas 读取、清洗、筛选、合并和聚合表格数据。
  3. 使用 Scikit-learn 建立 Pipeline、预处理、训练和交叉验证。
  4. 把实验拆分为数据准备、训练、评估和可视化模块。
- **最终产出**：一个端到端数据分析与预测项目，附可复现环境和实验报告。
- **验收标准**：
  - 能避免训练集与测试集信息泄漏。
  - 能构建可复现的 Pipeline。
  - 能解释主要指标并分析模型失败样本。
- **学习入口与逐项出处**：
  - [NumPy 教程](https://numpy.org/learn/)
    - 来源：ChatGPT 推荐｜NumPy、Pandas、Scikit-learn 官方文档
  - [Pandas 入门](https://pandas.pydata.org/docs/getting_started/)
    - 来源：ChatGPT 推荐｜NumPy、Pandas、Scikit-learn 官方文档
  - [Scikit-learn 用户指南](https://scikit-learn.org/stable/user_guide.html)
    - 来源：ChatGPT 推荐｜NumPy、Pandas、Scikit-learn 官方文档
- **本条路线归属**：ChatGPT 推荐｜NumPy、Pandas、Scikit-learn 官方文档

### 22｜机器学习算法手写与对照实验

- **学习时长**：2–3 周 · 约 15–20 小时
- **这份资料解决什么问题**：通过简化实现理解算法内部机制，而不是停留在调用库。
- **前置要求**：已学线性回归、逻辑回归、梯度下降和模型评估。
- **建议学习过程**：
  1. 用 NumPy 实现线性回归和逻辑回归的前向计算与梯度更新。
  2. 实现 K-means，观察初始化和聚类数对结果的影响。
  3. 实现一个简化决策树或 PCA。
  4. 将手写结果与 Scikit-learn 对照，检查差异和数值误差。
  5. 记录实现中的假设、边界情况和失败案例。
- **最终产出**：Machine Learning From Scratch 小仓库，至少 3 个算法实现及对照实验。
- **验收标准**：
  - 代码能在小型测试数据上运行。
  - 能解释每个算法核心步骤。
  - 能说明手写实现与成熟库实现的差异。
- **学习入口与逐项出处**：
  - [Datawhale 机器学习实践资源入口](https://github.com/datawhalechina)
    - 来源：ChatGPT 推荐｜机器学习算法手写练习
- **本条路线归属**：ChatGPT 推荐｜机器学习算法手写练习

### 23｜计算机视觉与机器人感知入门

- **学习时长**：每周约 1–2 小时
- **这份资料解决什么问题**：为多模态模型和机器人视觉建立概念基础。
- **前置要求**：矩阵运算、Python 和机器学习入门。
- **建议学习过程**：
  1. 理解像素、通道、分辨率、颜色空间和图像张量。
  2. 了解图像分类、目标检测、分割的任务区别。
  3. 使用 OpenCV 读取图像、显示图像并做基础变换。
  4. 理解相机内参、外参和坐标系的基本意义；暂不要求完整标定。
  5. 观察机器人数据中图像、深度和状态信息如何共同描述环境。
- **最终产出**：一个 OpenCV 图像处理小项目 + 一张机器人多模态感知数据流图。
- **验收标准**：
  - 能解释 RGB 图像的张量形状。
  - 能区分分类、检测和分割。
  - 能说明相机坐标系与机器人坐标系为何需要转换。
- **学习入口与逐项出处**：
  - [OpenCV 官方文档](https://docs.opencv.org/)
    - 来源：用户提供｜参考资源截图列有 OpenCV 官方文档；Hugging Face Computer Vision 课程为 ChatGPT 补充
  - [Hugging Face Computer Vision](https://huggingface.co/learn/computer-vision-course)
    - 来源：用户提供｜参考资源截图列有 OpenCV 官方文档；Hugging Face Computer Vision 课程为 ChatGPT 补充
- **本条路线归属**：用户提供｜参考资源截图列有 OpenCV 官方文档；Hugging Face Computer Vision 课程为 ChatGPT 补充

#### 配套讲义｜人工智能基础知识手册

**资料**：[人工智能基础知识手册 PDF](./人工智能基础知识手册%281%29%281%29.pdf)  
**出处**：用户上传 PDF。封面/版权页标注作者臧炫懿、DeepSeek-V4-Pro、日期 2026-07-21；可见版权页未明确标注北京大学机构归属，因此 Wiki 按你上传的资料记录，不额外称它为北京大学官方教材。

- **本阶段读什么**：
  - 第一章《人工智能的数学基础》（印刷页 1–33）：微积分、线性代数、张量、概率与统计。
  - 第二章《线性层》（印刷页 34–62）：机器学习基本过程、损失函数、梯度下降、训练/验证/测试、过拟合、优化器、回归与多层神经网络、PyTorch 实操。
- **阅读方法**：把它当作机器学习课程的配套讲义，不要求一次性全部吃透；每次学到损失函数、梯度、矩阵或张量时，再回到对应小节。

#### 你此前参考资源截图中的资料

**OpenCV 官方文档**
- 简介：用于图像读取、图像变换、相机与视觉数据处理。
- 链接：[OpenCV 官方文档](https://docs.opencv.org/)
- 出处：用户提供｜参考资源截图

**Pillow 官方文档**
- 简介：Python 图像打开、保存、裁剪、格式转换和基础图像处理。
- 链接：[Pillow 官方文档](https://pillow.readthedocs.io/)
- 出处：用户提供｜参考资源截图

**Hugging Face Hub**
- 简介：查找和使用模型、数据集及演示空间；先学会读模型卡和数据集卡。
- 链接：[Hugging Face Hub](https://huggingface.co/)
- 出处：用户提供｜参考资源截图

**ModelScope 魔搭社区**
- 简介：国内模型、数据集与模型体验/部署资源入口。
- 链接：[ModelScope 魔搭社区](https://www.modelscope.cn/)
- 出处：用户提供｜参考资源截图

#### 本阶段的最低验收
- 能解释训练/验证/测试集、损失函数、梯度下降、过拟合与模型评价指标。
- 完成回归、分类、聚类至少 3 组实验，并做误差分析。

#### CSDIY 课程导航中的相关课程

- **Stanford CS229 Machine Learning**：[CSDIY 课程条目](https://csdiy.wiki/机器学习/CS229/)。所在栏目：机器学习。出处：用户提供｜CSDIY 导航。建议在 Andrew Ng 课程之后作为进阶候选，不要求现在就完整学习。
- **NTU 李宏毅机器学习课程**：[CSDIY 课程条目](https://csdiy.wiki/深度学习/LHY/)。所在栏目：深度学习。出处：用户提供｜CSDIY 导航。可作为深度学习主课候选，和《动手学深度学习》二选一做主线。

## 阶段4｜第 10–12 个月：深度学习与 PyTorch

**阶段定位**：从经典机器学习进入神经网络，掌握训练循环、反向传播、CNN 与 Transformer 基础。

**本阶段重点**：深度学习主线；具身视觉和系统性能穿插  
**投入建议**：每周约 10–12 小时

### 本阶段课程与资料

### 24｜PyTorch 基础与训练工作流

- **学习时长**：3–4 周 · 约 18–25 小时
- **这份资料解决什么问题**：能够使用 PyTorch 编写、训练、保存和评估神经网络。
- **前置要求**：Python、NumPy、机器学习基础。
- **建议学习过程**：
  1. 学习 Tensor、shape、dtype、设备和基础运算。
  2. 理解 autograd、计算图和梯度清零。
  3. 学习 Dataset、DataLoader、nn.Module、loss 和 optimizer。
  4. 写出完整训练循环：前向—损失—反向—更新—验证。
  5. 学习模型保存、加载、随机种子和 GPU/CPU 设备切换。
- **最终产出**：一个规范 PyTorch 训练项目，包含训练脚本、配置、日志、模型权重和评估脚本。
- **验收标准**：
  - 能不依赖教程写出基本训练循环。
  - 能解释梯度何时计算、何时清零和参数何时更新。
  - 能保存并加载模型，复现实验结果。
- **学习入口与逐项出处**：
  - [PyTorch Tutorials](https://pytorch.org/tutorials/)
    - 来源：ChatGPT 推荐｜PyTorch 官方教程与深入浅出 PyTorch
  - [深入浅出 PyTorch](https://github.com/datawhalechina/thorough-pytorch)
    - 来源：ChatGPT 推荐｜PyTorch 官方教程与深入浅出 PyTorch
- **本条路线归属**：ChatGPT 推荐｜PyTorch 官方教程与深入浅出 PyTorch

### 25｜深度学习主课程：李宏毅或动手学深度学习选主线

- **学习时长**：6–8 周 · 约 35–50 小时
- **这份资料解决什么问题**：系统理解神经网络、优化、CNN、序列模型和注意力机制。
- **前置要求**：机器学习基础、微积分和线性代数。
- **建议学习过程**：
  1. 主课程二选一：李宏毅课程偏讲解与直觉；动手学深度学习偏理论与代码结合。
  2. 学习 MLP、激活函数、损失函数、反向传播和优化器。
  3. 学习 CNN、卷积、池化、感受野和图像分类。
  4. 学习 RNN/LSTM 的基本动机，理解序列建模的发展。
  5. 学习 Attention 的基本思想，为 Transformer 做准备。
  6. 每章至少完成一个小实验，观察模型容量、学习率和正则化的影响。
- **最终产出**：课程笔记 + 至少两个模型实验（MLP、CNN），包含训练曲线和误差分析。
- **验收标准**：
  - 能画出 MLP 前向传播和反向传播流程。
  - 能解释卷积核、步长、填充和特征图。
  - 能解释学习率过大/过小的现象。
  - 能说明 Attention 解决的序列建模问题。
- **学习入口与逐项出处**：
  - [动手学深度学习](https://d2l.ai/)
    - 来源：用户提供｜CSDIY「深度学习」栏目列有李宏毅课程；参考资源截图提到 B 站《动手学深度学习 PyTorch 版》，本 Wiki 补充教材直达入口
  - [CSDIY 课程地图（李宏毅课程入口）](https://csdiy.wiki/)
    - 来源：用户提供｜CSDIY 课程导航中的对应栏目/课程条目
- **本条路线归属**：用户提供｜CSDIY「深度学习」栏目列有李宏毅课程；参考资源截图提到 B 站《动手学深度学习 PyTorch 版》，本 Wiki 补充教材直达入口

### 26｜深度学习实验：CNN 图像分类

- **学习时长**：2–3 周 · 约 15–20 小时
- **这份资料解决什么问题**：把理论转化为可复现的模型训练实验。
- **前置要求**：PyTorch 基础、CNN 基本原理。
- **建议学习过程**：
  1. 选择 CIFAR-10 或其他小型公开数据集。
  2. 建立基线 CNN，记录训练/验证损失和准确率。
  3. 尝试数据增强、BatchNorm、Dropout 或不同优化器。
  4. 观察过拟合、类别错误和训练稳定性。
  5. 写实验报告，明确每次改动、假设和结果。
- **最终产出**：CNN 图像分类项目 + 实验对照表 + 错误样本分析。
- **验收标准**：
  - 训练和评估流程分离正确。
  - 能够解释至少两种改动带来的性能变化。
  - 能够展示混淆矩阵或典型错误样本。
- **学习入口与逐项出处**：
  - [PyTorch Tutorials](https://pytorch.org/tutorials/)
    - 来源：用户提供｜CSDIY「深度学习」栏目列有 Stanford CS231n；参考资源截图也提到 Stanford CNN 课程
  - [CIFAR-10](https://www.cs.toronto.edu/~kriz/cifar.html)
    - 来源：用户提供｜CSDIY「深度学习」栏目列有 Stanford CS231n；参考资源截图也提到 Stanford CNN 课程
- **本条路线归属**：用户提供｜CSDIY「深度学习」栏目列有 Stanford CS231n；参考资源截图也提到 Stanford CNN 课程

### 27｜Transformer 入门与最小实现

- **学习时长**：2–3 周 · 约 15–20 小时
- **这份资料解决什么问题**：理解从 Attention 到 Transformer 的结构逻辑。
- **前置要求**：深度学习基础、矩阵乘法、Softmax 和反向传播。
- **建议学习过程**：
  1. 学习 Query、Key、Value 和 Scaled Dot-Product Attention。
  2. 理解 Multi-Head Attention、位置编码和残差连接。
  3. 理解 Encoder、Decoder、Mask 和 Decoder-only 架构。
  4. 用 PyTorch 实现一个简化 Self-Attention 模块。
  5. 用小型序列任务验证输入、注意力权重和输出形状。
- **最终产出**：Transformer 结构图 + 一个可运行的简化 Attention/Transformer 实现。
- **验收标准**：
  - 能从张量形状解释 Q、K、V 的计算。
  - 能解释因果 Mask 为什么防止看到未来 token。
  - 能画出一个 Decoder block 的主要组成。
- **学习入口与逐项出处**：
  - [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
    - 来源：用户提供｜上传的《人工智能基础知识手册》第五章 Transformer；论文和图解入口由 ChatGPT 补充
  - [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
    - 来源：用户提供｜上传的《人工智能基础知识手册》第五章 Transformer；论文和图解入口由 ChatGPT 补充
- **本条路线归属**：用户提供｜上传的《人工智能基础知识手册》第五章 Transformer；论文和图解入口由 ChatGPT 补充

### 28｜GPU、张量内存与机器人运动学入门

- **学习时长**：每周约 1–2 小时；分两条短支线
- **这份资料解决什么问题**：初步理解模型训练的硬件约束，并为机器人仿真建立运动学基础。
- **前置要求**：PyTorch、矩阵与坐标变换初步知识。
- **建议学习过程**：
  1. 理解 CPU 与 GPU 在并行计算上的基本差异。
  2. 观察 Tensor 的设备、显存占用和 batch size 对训练的影响。
  3. 学习齐次变换矩阵、旋转和平移的表示。
  4. 使用二维二连杆机械臂理解正运动学和逆运动学直觉。
  5. 只做小规模实验，不在此阶段深入 CUDA 或完整机器人动力学。
- **最终产出**：GPU/显存实验记录 + 二连杆机械臂运动学可视化或计算脚本。
- **验收标准**：
  - 能解释显存为什么会随模型、batch 和中间激活变化。
  - 能进行简单二维坐标变换。
  - 能解释正运动学与逆运动学分别解决什么问题。
- **学习入口与逐项出处**：
  - [Modern Robotics](https://hades.mech.northwestern.edu/index.php/Modern_Robotics)
    - 来源：ChatGPT 推荐｜GPU/CUDA 与机器人运动学入门
  - [PyTorch CUDA notes](https://pytorch.org/docs/stable/notes/cuda.html)
    - 来源：ChatGPT 推荐｜GPU/CUDA 与机器人运动学入门
- **本条路线归属**：ChatGPT 推荐｜GPU/CUDA 与机器人运动学入门

#### 配套讲义｜人工智能基础知识手册（深度学习章节）

**建议阅读**：
- 第三章《卷积神经网络》（印刷页 63–82）：卷积、池化、上采样、图像分类和目标检测。
- 第四章《递归神经网络》（印刷页 83–91）：RNN、BPTT、梯度消失/爆炸、LSTM 与 GRU。
- 第五章《Transformer 架构》（印刷页 92–108）：自注意力、多头注意力、Tokenizer、Embedding、位置编码、BERT/GPT，以及多模态学习。
- 第六章《对抗学习》（印刷页 109–114）：GAN 基本思想与训练问题，作为选读，不必优先于 CNN/Transformer。

**出处**：用户上传 PDF《人工智能基础知识手册》。

#### 你此前参考资源截图中的资料

**《动手学深度学习（PyTorch版）》B站课程系列**
- 简介：结合视频和在线教材学习张量、自动求导、线性网络、CNN、RNN 与注意力。
- 链接：[《动手学深度学习（PyTorch版）》B站课程系列](https://space.bilibili.com/1567748478/channel/seriesdetail?sid=358497)
- 出处：用户提供｜参考资源截图提到该课程；本 Wiki 补充可访问的视频系列入口

**《动手学深度学习》在线教材**
- 简介：作为视频课程的章节、代码和公式配套资料；建议视频与教材同步，不要只看视频。
- 链接：[《动手学深度学习》在线教材](https://zh.d2l.ai/)
- 出处：ChatGPT 推荐｜补充教材直达入口

**Stanford CS231n：Convolutional Neural Networks for Visual Recognition**
- 简介：系统学习卷积网络、视觉识别、检测/定位和端到端视觉模型。
- 链接：[Stanford CS231n：Convolutional Neural Networks for Visual Recognition](https://cs231n.stanford.edu/2020/)
- 出处：用户提供｜参考资源截图提到 Coursera/Stanford CNN 课程；本 Wiki 补充 Stanford 官方课程入口

#### 本阶段的最低验收
- 能独立写出 PyTorch 训练循环。
- 能解释 CNN、RNN、Attention、Transformer 的主要结构和适用问题。
- 完成 CNN 图像分类与简化 Transformer/Attention 实现。

#### CSDIY 课程导航中的相关课程

- **Stanford CS231n：CNN for Visual Recognition**：[CSDIY 课程条目](https://csdiy.wiki/深度学习/CS231/)。所在栏目：深度学习。出处：用户提供｜CSDIY 导航；你此前的参考资源截图也提到 Stanford CNN 课程。建议在 PyTorch、CNN 基础之后选学。

## 阶段5｜第 13–15 个月：LLM 原理与模型训练

**阶段定位**：从理解 Transformer 走向理解 LLM 数据、训练目标、预训练、微调与推理。

**本阶段重点**：模型原理与训练；工程系统继续支撑  
**投入建议**：每周约 10–12 小时

### 本阶段课程与资料

### 29｜Happy-LLM：大语言模型系统学习

- **学习时长**：4–6 周 · 约 25–35 小时
- **这份资料解决什么问题**：建立 LLM 从数据到模型、从训练到推理的整体知识结构。
- **前置要求**：Transformer、PyTorch 基础。
- **建议学习过程**：
  1. 先读整体目录，画出 LLM 发展和技术模块地图。
  2. 学习 Tokenizer、Embedding、位置编码和 Transformer。
  3. 学习预训练目标、数据处理、训练流程和模型评估。
  4. 学习 SFT、指令微调、偏好对齐的基本概念。
  5. 学习推理、采样策略、上下文窗口和 KV Cache 的基本机制。
  6. 每个模块写“问题背景—原理—结构—实现—局限”的专题笔记。
- **最终产出**：一份 LLM 技术地图 + 至少 8 篇专题笔记 + 关键模块代码实验。
- **验收标准**：
  - 能画出 Decoder-only LLM 的数据流。
  - 能解释 Tokenizer、Embedding、Attention 和 LM Head 的作用。
  - 能区分预训练、SFT 和偏好对齐。
  - 能解释 KV Cache 为什么能减少重复计算。
- **学习入口与逐项出处**：
  - [Happy-LLM](https://github.com/datawhalechina/happy-llm)
    - 来源：用户提供｜上传的 AI 课程清单 HTML
- **本条路线归属**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 1 项 Happy-LLM

### 30｜从零构建 LLM：白盒实践二选一

- **学习时长**：4–6 周 · 约 25–40 小时
- **这份资料解决什么问题**：通过小模型实现理解语言模型的训练和生成，而不是只会调用 Transformers。
- **前置要求**：PyTorch、Transformer 和训练循环。
- **建议学习过程**：
  1. 在 LLMs-from-scratch-cn 与 Tiny-Universe 中选择一套作为主线，不要重复完成两套。
  2. 准备小规模文本数据，理解预处理和 Tokenizer。
  3. 实现或运行 Embedding、Attention、Transformer block 和语言模型头。
  4. 编写训练循环，观察 loss 和生成质量变化。
  5. 尝试改变模型规模、上下文长度或训练数据，记录对结果的影响。
- **最终产出**：一个可训练、可生成的小型 GPT 项目，包含代码、训练日志、配置和复现说明。
- **验收标准**：
  - 能从输入 token 解释到 logits 的前向路径。
  - 能完成一次训练并生成文本。
  - 能解释训练损失下降不等于生成质量一定好。
  - 能复现实验并说明资源限制。
- **学习入口与逐项出处**：
  - [LLMs from Scratch 中文资源](https://github.com/datawhalechina/llms-from-scratch-cn)
    - 来源：ChatGPT 推荐｜从零构建 LLM 的白盒实践资源
  - [Tiny-Universe](https://github.com/datawhalechina/tiny-universe)
    - 来源：ChatGPT 推荐｜从零构建 LLM 的白盒实践资源
- **本条路线归属**：ChatGPT 推荐｜从零构建 LLM 的白盒实践资源

### 31｜预训练、SFT 与 LoRA 微调实践

- **学习时长**：2–3 周 · 约 15–20 小时
- **这份资料解决什么问题**：理解模型训练数据、训练目标和参数高效微调的基本流程。
- **前置要求**：PyTorch 和小型 Transformer 训练经验。
- **建议学习过程**：
  1. 区分预训练语料、指令数据和偏好数据。
  2. 学习 SFT 数据格式、训练/验证切分和数据质量检查。
  3. 选择小型开源模型，使用现成训练框架完成一次 LoRA 微调。
  4. 比较微调前后在固定测试集上的表现。
  5. 记录显存、训练时长、超参数和失败案例。
- **最终产出**：一次小模型 LoRA 微调实验 + 数据说明 + 前后对照评测。
- **验收标准**：
  - 能解释 LoRA 为什么减少可训练参数。
  - 能说明训练集和评测集为什么要隔离。
  - 能用固定测试集比较微调前后效果。
  - 能说明实验结论的局限，避免只凭几个例子下结论。
- **学习入口与逐项出处**：
  - [Hugging Face PEFT](https://huggingface.co/docs/peft/index)
    - 来源：ChatGPT 推荐｜Hugging Face PEFT 与 Transformers 训练文档
  - [Transformers Training](https://huggingface.co/docs/transformers/training)
    - 来源：ChatGPT 推荐｜Hugging Face PEFT 与 Transformers 训练文档
- **本条路线归属**：ChatGPT 推荐｜Hugging Face PEFT 与 Transformers 训练文档

### 32｜LLM 推理与上下文机制专题

- **学习时长**：2–3 周 · 约 12–18 小时
- **这份资料解决什么问题**：理解模型推理时的计算、缓存和服务层约束。
- **前置要求**：Transformer、KV Cache 和模型推理基础。
- **建议学习过程**：
  1. 理解 Prefill 与 Decode 两个阶段。
  2. 分析 KV Cache 的键值张量、层数、头数、序列长度与显存关系。
  3. 了解采样参数、Batching、量化和上下文窗口。
  4. 阅读推理框架文档，理解连续批处理、Paged Attention 等概念。
  5. 用小实验比较不同上下文长度或 batch size 的延迟和显存占用。
- **最终产出**：一份推理流程图 + KV Cache 估算表 + 至少一组性能测量记录。
- **验收标准**：
  - 能解释 Prefill 与 Decode 的差异。
  - 能估算 KV Cache 随序列长度增长的趋势。
  - 能区分模型权重显存、KV Cache 和中间激活。
  - 能解释量化可能带来的收益和精度代价。
- **学习入口与逐项出处**：
  - [Hugging Face Generation](https://huggingface.co/docs/transformers/generation_strategies)
    - 来源：ChatGPT 推荐｜Hugging Face Generation 与 vLLM；Datawhale LLM Algo-LeetCode 推理优化见课程清单第 4 项
  - [vLLM 文档](https://docs.vllm.ai/)
    - 来源：ChatGPT 推荐｜Hugging Face Generation 与 vLLM；Datawhale LLM Algo-LeetCode 推理优化见课程清单第 4 项
- **本条路线归属**：ChatGPT 推荐｜Hugging Face Generation 与 vLLM；Datawhale LLM Algo-LeetCode 推理优化见课程清单第 4 项

### 33｜VLM、VLA 与机器人动作表示概览

- **学习时长**：每周约 1–2 小时
- **这份资料解决什么问题**：理解视觉语言模型如何进一步连接到机器人动作。
- **前置要求**：Transformer、多模态和机器人系统基础。
- **建议学习过程**：
  1. 区分图像问答型 VLM 与输出动作的 VLA。
  2. 了解视觉编码器、语言模型、动作表示和机器人状态输入。
  3. 认识 Action Tokenization、Action Chunking 和模仿学习。
  4. 浏览 OpenVLA、SmolVLA 或 LeRobot 项目文档，先理解整体架构。
  5. 写一篇“语言指令如何变成机器人动作”的技术流程说明。
- **最终产出**：VLM/VLA 架构对比图 + 机器人动作表示专题笔记。
- **验收标准**：
  - 能说明 VLM 和 VLA 的输入输出差异。
  - 能解释动作数据为什么需要与机器人状态和时间对齐。
  - 能画出视觉、语言、策略和控制之间的关系。
- **学习入口与逐项出处**：
  - [OpenVLA](https://github.com/openvla/openvla)
    - 来源：ChatGPT 推荐｜OpenVLA、LeRobot；多模态基础可回看用户提供的 AI 基础手册第五章
  - [LeRobot](https://github.com/huggingface/lerobot)
    - 来源：ChatGPT 推荐｜OpenVLA、LeRobot；多模态基础可回看用户提供的 AI 基础手册第五章
- **本条路线归属**：ChatGPT 推荐｜OpenVLA、LeRobot；多模态基础可回看用户提供的 AI 基础手册第五章

#### 配套讲义｜人工智能基础知识手册（LLM、生成模型与后训练）

**建议阅读**：
- 第五章《Transformer 架构》（印刷页 92–108）：回看 Attention、Tokenizer、Embedding、GPT。
- 第七章《生成模型》（印刷页 115–135）：DDPM、得分函数、SDE/ODE、Flow Matching；帮助理解生成模型。
- 第八章 8.6《大语言模型的后训练：微调和对齐（RLHF）》（印刷页 145–157）：SFT、奖励模型和 RLHF。

**出处**：用户上传 PDF《人工智能基础知识手册》。

#### 来自你上传的 Datawhale 课程清单的补充资源

### Datawhale 补充资源｜LLM Algo-LeetCode：模型架构与训练方向

- **简介**：学习 Attention 表示与 KV 压缩、位置编码、长上下文、MoE、SSM 与混合记忆、Transformer 状态保存、计算图、梯度与有效更新等。
- **适合对象**：希望深入理解大模型架构与训练机制的算法工程师、开发工程师。
- **建议时机**：与推理优化、后训练优化、算子优化共用同一个仓库，是不同学习方向。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/llm-algo-leetcode)
  - [在线课程主页](https://datawhalechina.github.io/llm-algo-leetcode/)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 2 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜LLM Algo-LeetCode：推理优化方向

- **简介**：学习请求与工作负载、服务调度、KV Cache 表示与复用、服务迭代预算、调度与异构协同、量化推理、单卡服务验证、分布式扩展与端到端决策。
- **适合对象**：对 LLM 推理系统、服务性能和算法工程感兴趣的学习者。
- **建议时机**：建议在理解 Transformer 和基本推理流程后学习。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/llm-algo-leetcode)
  - [在线课程主页](https://datawhalechina.github.io/llm-algo-leetcode/)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 4 项（课程清单中的 Datawhale 课程/项目条目）。

#### 本阶段的最低验收
- 能解释 Tokenizer、Embedding、Transformer、预训练、SFT、LoRA、KV Cache 和生成流程。
- 训练一个小型 GPT 或完成一个可复现的 LoRA 微调实验。

#### CSDIY 课程导航中的 LLM 进阶课程

- **CMU 11-868：Large Language Model System**：[CSDIY 课程条目](https://csdiy.wiki/深度生成模型/大语言模型/CMU11-868/)。所在栏目：大语言模型。出处：用户提供｜CSDIY 导航。建议先掌握 Transformer、推理流程和基本 LLM 工程，再选读。
- **CMU 11-667：Large Language Models: Methods and Applications**：[CSDIY 课程条目](https://csdiy.wiki/深度生成模型/大语言模型/CMU11-667/)。所在栏目：大语言模型。出处：用户提供｜CSDIY 导航。该课程先修要求较高，适合第 19–24 个月研究深化，不作为第 13–15 个月必修。

## 阶段6｜第 16–18 个月：多模态与具身智能综合实践

**阶段定位**：把 AI 模型、Agent 工程、机器人感知、仿真和策略学习连接起来。

**本阶段重点**：具身智能实践；模型与系统能力综合应用  
**投入建议**：每周约 10–12 小时

### 本阶段课程与资料

### 34｜Every-Embodied：具身智能主线课程

- **学习时长**：4–6 周 · 约 25–35 小时
- **这份资料解决什么问题**：系统认识机器人基础、感知、控制、模仿学习和 VLA。
- **前置要求**：Python、机器学习/深度学习基础；机器人概念已初步接触。
- **建议学习过程**：
  1. 先浏览目录，区分机器人学、视觉感知、控制、强化学习、模仿学习和 VLA 模块。
  2. 优先学习机器人系统、传感器、坐标系和运动学基础。
  3. 学习视觉感知与机器人状态表示。
  4. 学习模仿学习和机器人数据集的基本组织方式。
  5. 选择一个小专题做代码或数据实验，不追求一次学完整个领域。
- **最终产出**：具身智能知识地图 + 一个可复现的小实验 + 专题报告。
- **验收标准**：
  - 能解释感知、规划、控制、执行的分层关系。
  - 能说明模仿学习与强化学习的基本差异。
  - 能描述一个 VLA 系统的主要模块。
- **学习入口与逐项出处**：
  - [Every-Embodied](https://github.com/datawhalechina/every-embodied)
    - 来源：ChatGPT 推荐｜Every-Embodied（不在你上传的 20 项课程清单中）
- **本条路线归属**：ChatGPT 推荐｜Every-Embodied（不在你上传的 20 项课程清单中）

### 35｜Modern Robotics：运动学与运动规划选学

- **学习时长**：3–4 周 · 约 18–25 小时
- **这份资料解决什么问题**：掌握理解机械臂运动所需的核心数学和机器人学概念。
- **前置要求**：线性代数、矩阵乘法、坐标变换。
- **建议学习过程**：
  1. 学习刚体位姿、旋转矩阵、齐次变换和坐标系。
  2. 学习正运动学：由关节变量求末端位姿。
  3. 学习逆运动学：由目标位姿求关节变量。
  4. 了解速度运动学、轨迹生成和运动规划。
  5. 用简单机械臂模型计算或可视化末端轨迹。
- **最终产出**：二连杆/简化机械臂运动学代码或可视化，附坐标系说明。
- **验收标准**：
  - 能进行简单齐次变换。
  - 能解释正运动学与逆运动学。
  - 能说明关节空间与任务空间的区别。
- **学习入口与逐项出处**：
  - [Modern Robotics 官方资源](https://hades.mech.northwestern.edu/index.php/Modern_Robotics)
    - 来源：ChatGPT 推荐｜Modern Robotics
- **本条路线归属**：ChatGPT 推荐｜Modern Robotics

### 36｜MuJoCo 与机器人仿真

- **学习时长**：2–3 周 · 约 15–20 小时
- **这份资料解决什么问题**：在不购买硬件的情况下理解机器人和物体的物理交互。
- **前置要求**：Python、机器人基础概念。
- **建议学习过程**：
  1. 安装并运行官方示例，熟悉模型、关节、执行器和仿真步进。
  2. 观察机器人状态、关节位置、速度和接触信息。
  3. 尝试控制一个简单关节或机械臂。
  4. 搭建一个简化抓取/移动任务，记录成功和失败情况。
  5. 理解仿真和真实世界在摩擦、传感器噪声、控制频率上的差异。
- **最终产出**：一个 MuJoCo 仿真场景或控制脚本 + 演示视频/截图 + 实验说明。
- **验收标准**：
  - 能启动仿真并读取机器人状态。
  - 能改变控制输入并观察运动变化。
  - 能解释仿真结果不一定能直接迁移到真实机器人。
- **学习入口与逐项出处**：
  - [MuJoCo 文档](https://mujoco.readthedocs.io/en/stable/)
    - 来源：ChatGPT 推荐｜MuJoCo 官方文档
- **本条路线归属**：ChatGPT 推荐｜MuJoCo 官方文档

### 37｜ROS 2 实践与 LeRobot 数据工作流

- **学习时长**：3–4 周 · 约 18–25 小时
- **这份资料解决什么问题**：理解机器人通信、数据采集、策略训练和部署的工程流程。
- **前置要求**：Python、ROS 2 概念、基础深度学习。
- **建议学习过程**：
  1. 复习 ROS 2 Node、Topic、Service、Action 和 TF。
  2. 查看 LeRobot 数据集，理解 observation、action、timestamp 和 episode。
  3. 使用公开数据集可视化机器人状态、图像和动作。
  4. 运行一个官方预训练策略或示例 Notebook。
  5. 记录数据格式、策略输入输出和评估指标。
- **最终产出**：一个公开机器人数据集分析报告 + LeRobot 示例运行记录。
- **验收标准**：
  - 能解释一条机器人数据样本包含哪些信息。
  - 能说明策略的 observation 和 action。
  - 能运行或完整复现一个公开示例的核心步骤。
- **学习入口与逐项出处**：
  - [ROS 2 Tutorials](https://docs.ros.org/en/kilted/Tutorials.html)
    - 来源：ChatGPT 推荐｜ROS 2 与 LeRobot 工作流
  - [LeRobot 文档](https://huggingface.co/docs/lerobot/en/index)
    - 来源：ChatGPT 推荐｜ROS 2 与 LeRobot 工作流
  - [LeRobot GitHub](https://github.com/huggingface/lerobot)
    - 来源：ChatGPT 推荐｜ROS 2 与 LeRobot 工作流
- **本条路线归属**：ChatGPT 推荐｜ROS 2 与 LeRobot 工作流

### 38｜模仿学习与 ACT / Diffusion Policy 概览

- **学习时长**：2–3 周 · 约 15–20 小时
- **这份资料解决什么问题**：理解机器人如何从示范数据中学习动作策略。
- **前置要求**：PyTorch、机器人数据结构和基本仿真。
- **建议学习过程**：
  1. 理解 Behavior Cloning：输入状态/图像，预测示范动作。
  2. 了解数据分布偏移和示范数据质量的影响。
  3. 认识 ACT 的动作序列预测思路。
  4. 认识 Diffusion Policy 将动作生成视为条件生成过程的思路。
  5. 选择一个现成实现或公开数据集做推理/评估，不急于从零训练大模型。
- **最终产出**：模仿学习专题笔记 + 一次公开策略推理或评估实验。
- **验收标准**：
  - 能解释行为克隆的训练数据和目标。
  - 能说明训练分布与执行分布不一致的问题。
  - 能比较 ACT 与 Diffusion Policy 的基本思路。
- **学习入口与逐项出处**：
  - [LeRobot](https://github.com/huggingface/lerobot)
    - 来源：ChatGPT 推荐｜LeRobot 与 Diffusion Policy；可结合用户提供的 AI 基础手册第七、八章
  - [Diffusion Policy](https://diffusion-policy.cs.columbia.edu/)
    - 来源：ChatGPT 推荐｜LeRobot 与 Diffusion Policy；可结合用户提供的 AI 基础手册第七、八章
- **本条路线归属**：ChatGPT 推荐｜LeRobot 与 Diffusion Policy；可结合用户提供的 AI 基础手册第七、八章

### 39｜Embodied Task Agent：语言驱动的仿真任务

- **学习时长**：贯穿第 16–18 个月 · 约 25–40 小时
- **这份资料解决什么问题**：综合 Agent 规划、多模态感知和机器人策略，完成一个可展示项目。
- **前置要求**：已完成 Agent、PyTorch、机器人基础和仿真入门。
- **建议学习过程**：
  1. 选择一个边界清晰的仿真任务，例如桌面物体识别与目标位置规划。
  2. 定义系统模块：语言任务解析、环境感知、任务规划、动作策略、仿真执行和反馈。
  3. 先使用规则或现成模型完成基线，再逐步替换为学习策略。
  4. 加入执行日志、失败检测、重试/停止和安全边界。
  5. 设计不少于 20 次任务测试，记录成功率、失败类别和运行时长。
  6. 完成架构图、代码、演示视频和复盘报告。
- **最终产出**：可复现的 Embodied Task Agent 仿真项目 + 评测报告 + 演示视频。
- **验收标准**：
  - 系统能接收自然语言任务并执行一个限定任务。
  - 每个模块的输入输出和失败边界清楚。
  - 有至少 20 次测试记录，包含失败分析。
  - 能说明哪些部分是模型完成、哪些部分是规则/控制器完成。
- **学习入口与逐项出处**：
  - [OpenVLA](https://github.com/openvla/openvla)
    - 来源：ChatGPT 推荐｜OpenVLA、LeRobot 与 MuJoCo 综合项目
  - [LeRobot](https://github.com/huggingface/lerobot)
    - 来源：ChatGPT 推荐｜OpenVLA、LeRobot 与 MuJoCo 综合项目
  - [MuJoCo](https://mujoco.readthedocs.io/en/stable/)
    - 来源：ChatGPT 推荐｜OpenVLA、LeRobot 与 MuJoCo 综合项目
- **本条路线归属**：ChatGPT 推荐｜OpenVLA、LeRobot 与 MuJoCo 综合项目

#### 配套讲义｜人工智能基础知识手册（具身智能相关小节）

**只读相关小节**：
- 第七章 7.6.2《机器人动作生成》（印刷页 134）。
- 第八章 8.5.2《机器人控制》（印刷页 145）。
- 如需理解生成式策略，再回看第七章 DDPM、SDE/ODE 和 Flow Matching。

**出处**：用户上传 PDF《人工智能基础知识手册》。

#### 来自你上传的 Datawhale 课程清单的补充资源

### Datawhale 补充资源｜Nailongbot：从零开始组装设计桌面陪伴机器人

- **简介**：从认识零部件开始，完成机器人组装、固件烧录、联网配置和舵机校准，再实现语音对话、表情显示和动作；还可进行二次开发。
- **适合对象**：对 AI 陪伴、智能硬件和 DIY 机器人感兴趣的学生、开发者及创客。
- **建议时机**：需要实体硬件和配套零部件；二次开发建议具备基础 C++ 与 Git 知识。
- **链接**：
  - [课程 Wiki](https://nailong.nekokax.com)
  - [GitHub Wiki 仓库](https://github.com/luckyduck/nailongBotWiki)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 14 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜AI for Science

- **简介**：围绕科学问题进入计算流程，学习文献与实验资料组织、可信数据整理、科学模型训练与评估、科研工具调用、长任务运行和结果核验。
- **适合对象**：对 AI 辅助科研感兴趣的高校学生、科研人员和相关开发者。
- **建议时机**：课程按四个递进任务组织；可根据基础完成不同层次实践。
- **链接**：
  - [GitHub 实践仓库](https://github.com/TashanGKD/panshi-ai4s-practice)
  - [课程视频](https://community.tashan.ac.cn/learning)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 19 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜沐曦 AI4S 实战营

- **简介**：围绕国产 GPU 加速科研线上实战，面向 AI4S 和 AI 智能体科研应用，提供相关开源项目与实践入口。
- **适合对象**：对 AI4S 感兴趣的学习者、开发者和科研人员。
- **建议时机**：截图注明项目同步托管在 GitLink；学习环境和指南为你额外提供的飞书链接。
- **链接**：
  - [GitLink 开源项目](https://gitlink.org.cn/ccf-ai-infra/Science-Agent-Lab)
  - [学习环境](https://yuanzhen.feishu.cn/docx/Jy7BdMx7DoIqQVxKXOzczaYkn7d)
  - [学习指南](https://yuanzhen.feishu.cn/wiki/OAJswmIFbiP3eSk2PGacwsi4nhb?create_from=copy_within_wiki)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 20 项（课程清单中的 Datawhale 课程/项目条目）。

#### 本阶段的最低验收
- 能解释感知、状态表示、运动学、规划、控制和执行之间的关系。
- 在仿真或公开数据上完成一个可复现的机器人任务实验。

## 阶段7｜第 19–24 个月（选修深化）：从工程实践走向研究

**阶段定位**：不再大量增加通识课程；根据兴趣选择 LLM/系统或具身智能作为一个主攻方向。

**本阶段重点**：论文阅读、复现、对照实验与研究问题  
**投入建议**：每周约 10–12 小时；按学期安排调整

### 本阶段课程与资料

### 40｜Stanford CS336：Language Modeling from Scratch

- **学习时长**：6–10 周 · 选修进阶
- **这份资料解决什么问题**：深入理解语言模型训练数据、架构、优化、系统和评估。
- **前置要求**：Transformer、PyTorch、基础 LLM 训练经验；数学和编程较扎实。
- **建议学习过程**：
  1. 先阅读课程要求，判断数学、系统和 GPU 资源是否满足。
  2. 按主题学习数据处理、架构、训练、并行和推理。
  3. 选择一个作业或实验子集完成，不要求一开始完成全部高强度作业。
  4. 复现实验并记录硬件、训练时长和结果。
- **最终产出**：一个 CS336 相关作业/实验复现 + 技术报告。
- **验收标准**：
  - 能解释实验设计和核心实现。
  - 能复现关键指标或明确说明未复现原因。
  - 能分析算力、数据和实现对结果的影响。
- **学习入口与逐项出处**：
  - [Stanford CS336](https://cs336.stanford.edu/)
    - 来源：ChatGPT 推荐｜Stanford CS336
- **本条路线归属**：ChatGPT 推荐｜Stanford CS336

### 41｜模型推理优化、量化与 GPU 编程选修

- **学习时长**：按兴趣 4–8 周
- **这份资料解决什么问题**：向模型系统、推理引擎和底层性能优化靠拢。
- **前置要求**：C/C++、PyTorch、GPU 基础；有合适 GPU 环境。
- **建议学习过程**：
  1. 先学习模型推理的计算瓶颈和显存瓶颈。
  2. 学习量化的基本思想、误差和性能权衡。
  3. 阅读 vLLM 等推理框架的架构文档。
  4. 有硬件条件再学习 CUDA/Triton 和算子优化。
  5. 选择一个小优化点做前后性能对比。
- **最终产出**：一次可复现的推理性能对比实验，记录吞吐、延迟、显存和精度。
- **验收标准**：
  - 能解释优化前后的瓶颈。
  - 能在相同测试条件下比较结果。
  - 能说明性能提升是否以质量或资源代价换取。
- **学习入口与逐项出处**：
  - [vLLM 文档](https://docs.vllm.ai/)
    - 来源：用户提供｜课程清单 HTML 第 2–5、15–18 项含 LLM Algo-LeetCode、Hello-GPU、Hello-ROCm、GGUF、C++ LLM Engine；vLLM/Triton/CUDA 文档由 ChatGPT 补充
  - [Triton 教程](https://triton-lang.org/main/getting-started/tutorials/index.html)
    - 来源：用户提供｜课程清单 HTML 第 2–5、15–18 项含 LLM Algo-LeetCode、Hello-GPU、Hello-ROCm、GGUF、C++ LLM Engine；vLLM/Triton/CUDA 文档由 ChatGPT 补充
  - [CUDA C++ Programming Guide](https://docs.nvidia.com/cuda/cuda-c-programming-guide/)
    - 来源：用户提供｜课程清单 HTML 第 2–5、15–18 项含 LLM Algo-LeetCode、Hello-GPU、Hello-ROCm、GGUF、C++ LLM Engine；vLLM/Triton/CUDA 文档由 ChatGPT 补充
- **本条路线归属**：用户提供｜课程清单 HTML 第 2–5、15–18 项含 LLM Algo-LeetCode、Hello-GPU、Hello-ROCm、GGUF、C++ LLM Engine；vLLM/Triton/CUDA 文档由 ChatGPT 补充

### 42｜VLA / World Model 论文与复现实验

- **学习时长**：6–10 周 · 选修进阶
- **这份资料解决什么问题**：从阅读项目说明走向理解论文方法、数据、指标和实验设计。
- **前置要求**：深度学习、Transformer、多模态和机器人数据基础。
- **建议学习过程**：
  1. 选定一个具体主题：VLA、World Model、模仿学习或 Sim-to-Real。
  2. 阅读 1 篇综述和 2–3 篇代表论文，整理问题、方法、数据和指标。
  3. 选择一个公开代码库和公开数据集，先跑通 Baseline。
  4. 提出一个范围很小的对照实验，例如数据量、动作表示或输入模态变化。
  5. 记录失败、资源限制和结论边界。
- **最终产出**：论文阅读矩阵 + Baseline 复现 + 一组对照实验 + 研究报告。
- **验收标准**：
  - 能准确说清论文解决的问题，而不是只复述摘要。
  - 能解释方法与 Baseline 的差别。
  - 实验可复现，结论有数据支撑。
  - 能指出至少两个局限或下一步问题。
- **学习入口与逐项出处**：
  - [OpenVLA](https://github.com/openvla/openvla)
    - 来源：ChatGPT 推荐｜OpenVLA、Learn World Model 与具身智能论文复现
  - [Learn World Model](https://github.com/datawhalechina/learn-world-model)
    - 来源：ChatGPT 推荐｜OpenVLA、Learn World Model 与具身智能论文复现
  - [Every-Embodied](https://github.com/datawhalechina/every-embodied)
    - 来源：ChatGPT 推荐｜OpenVLA、Learn World Model 与具身智能论文复现
- **本条路线归属**：ChatGPT 推荐｜OpenVLA、Learn World Model 与具身智能论文复现

### 43｜论文复现与研究报告工作流

- **学习时长**：贯穿第 19–24 个月
- **这份资料解决什么问题**：建立可持续的研究方法，而不是只完成一次课程项目。
- **前置要求**：至少一个可运行的模型或工程项目。
- **建议学习过程**：
  1. 确定一个足够具体的问题，写出假设和可证伪的预期。
  2. 阅读原论文、官方代码、数据集说明和相关工作。
  3. 固定环境、随机种子、数据切分和评估指标。
  4. 先复现 Baseline，再只改变一个关键因素。
  5. 保留实验日志、配置、代码版本和失败结果。
  6. 写报告：背景、方法、实验、结果、局限和下一步。
- **最终产出**：一个公开可复现的研究仓库和完整技术报告；若暂不公开，至少个人可复现。
- **验收标准**：
  - 他人能够按说明复现实验。
  - 结论由实验结果支持，不夸大。
  - 有 Baseline、有对照、有失败分析。
  - 能够提出下一步有价值且可执行的问题。
- **学习入口与逐项出处**：
  - [Papers with Code](https://paperswithcode.com/)
    - 来源：ChatGPT 推荐｜论文检索与复现实验工作流
  - [Hugging Face Papers](https://huggingface.co/papers)
    - 来源：ChatGPT 推荐｜论文检索与复现实验工作流
- **本条路线归属**：ChatGPT 推荐｜论文检索与复现实验工作流

#### 研究阶段回看两本手册

- 《计算机基础科学与开发手册》附录 A：在读系统、推理引擎和性能优化论文时，回看编译、虚拟内存、缓存与系统调用。
- 《人工智能基础知识手册》：按论文主题回看 Transformer、生成模型、RLHF、机器人动作生成等章节。不要把整本书重新从头刷一遍。

**出处**：用户上传的两本 PDF。

#### 来自你上传的 Datawhale 课程清单的补充资源

### Datawhale 补充资源｜LLM Algo-LeetCode：后训练优化方向

- **简介**：围绕后训练目标与阶段选择、监督数据与目标构造、参数更新、偏好数据、奖励信号、策略更新、轨迹生命周期、在线系统、独立评测与采用决策展开。
- **适合对象**：对模型后训练、对齐和训练流程感兴趣的学习者。
- **建议时机**：与模型架构与训练方向共用仓库；建议先具备基础 LLM 与 PyTorch 认知。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/llm-algo-leetcode)
  - [在线课程主页](https://datawhalechina.github.io/llm-algo-leetcode/)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 3 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜LLM Algo-LeetCode：算子优化方向

- **简介**：围绕内核与比较基线、图编译与算子融合、Triton 访存、融合与分块、Attention 与推理内核、CUDA 协作、资源与运行时、接口集成和负载复测展开。
- **适合对象**：对 GPU 编程、算子开发和 AI 计算加速感兴趣的学习者。
- **建议时机**：属于偏底层的专项方向，建议先学 GPU 基础与推理计算流程。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/llm-algo-leetcode)
  - [在线课程主页](https://datawhalechina.github.io/llm-algo-leetcode/)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 5 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜FDE 书籍 1 共读：《企业本体论：人人都是 FDE》

- **简介**：以退款助手落地实现的企业场景为切入点，了解企业本体、知识工程、多 Agent 协同、审计评测，以及 Agent 项目从立项到上线运营的关键站点。
- **适合对象**：希望理解 AI 价值落地逻辑的工程师、架构师、产品经理和管理者。
- **建议时机**：截图注明本次共学为前三章内容；偏业务建模和交付理解，不是编程入门课。
- **链接**：
  - [课程共读页面](https://m.datawhale.cn/learn/content/437)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 11 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜FDE 书籍 2 共读：《FDE：人工智能时代的客户价值交付》

- **简介**：围绕 Forward Deployed Engineer 岗位，理解企业 AI 项目交付全流程，包括问题甄别、客户获取、系统激活部署、续约维护、收入增加和规模化复制。
- **适合对象**：企业 AI 创业者、FDE 相关工程师，以及希望理解企业 AI 落地逻辑的从业者。
- **建议时机**：与 FDE 书籍 1 配套，偏客户价值交付和产业实践。
- **链接**：
  - [课程共读页面](https://m.datawhale.cn/learn/content/438)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 12 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜Hello-GPU：从 GPU 入门到 Agent 优化

- **简介**：以 AMD GPU 与 ROCm 为技术环境，通过 Vector Add 案例学习 GPU 架构、并行计算、程序运行、性能测量、瓶颈分析、Kernel 实现和自动优化。
- **适合对象**：具备基本 Python 或 C/C++ 编程能力、对 GPU 和 AI 计算加速感兴趣的学习者。
- **建议时机**：课程介绍以 AMD GPU / ROCm 为技术环境；建议先具备 Linux 命令行基础。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/hello-gpu)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 15 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜Hello-ROCm：零基础入门 ROCm

- **简介**：在 AMD GPU 与 ROCm 环境下完成环境配置、模型部署、模型微调和算子实践，理解主流框架与 ROCm 生态，并构建 AI 应用。
- **适合对象**：对大模型本地部署、微调训练、ROCm 生态或 AMD GPU 编程感兴趣的学习者。
- **建议时机**：需要 AMD GPU 或配套云算力；截图提到另有环境配置教程和学习安排，但未展示可复制链接。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/hello-rocm)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 16 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜GGUF 量化内幕

- **简介**：理解常用量化格式 Q2～Q8、IQ、UD_IQ，以及 PTQ1、STQ1 等三值量化，并通过 C++、C#、Python 代码解释和 ASCII 图表认识量化机制。
- **适合对象**：希望制作端侧推理引擎或量化模型的学习者。
- **建议时机**：适合作为模型推理和部署方向的专项学习。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/gguf-quant-internals)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 17 项（课程清单中的 Datawhale 课程/项目条目）。

### Datawhale 补充资源｜C++ LLM Engine：从零构建 C++ LLM 推理引擎

- **简介**：从 TinyLlama 真实推理开始，逐步实现模型加载、张量、算子、解码器、生成、缓存、调度和服务；先完成 CPU 主线，再扩展 CUDA 加速。
- **适合对象**：具备基础 C++ 能力、希望从模型文件走向推理服务系统的学习者。
- **建议时机**：建议先理解模型结构和推理流程；课程强调先 CPU 后 GPU。
- **链接**：
  - [GitHub 开源仓库](https://github.com/datawhalechina/cpp-llm-engine)
- **出处**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 18 项（课程清单中的 Datawhale 课程/项目条目）。

#### 本阶段的最低验收
- 选定一个主攻方向，不再同时开多个重型方向。
- 完成基线复现、对照实验、失败分析和可复现研究报告。

## 来源标注规则与核验清单

### 已确认来自你提供的资料

- **CSDIY**：你提供的课程导航；官网目录中可见编程入门、数据结构与算法、CSAPP、操作系统、网络、数据库、机器学习、深度学习和大语言模型等栏目。
- **AI 课程清单 HTML**：你上传的《AI课程清单_分类与优先级(2).html》，共 20 项，已按原编号归入对应阶段。
- **参考资源截图**：OpenCV、Pillow、Hugging Face Hub、ModelScope、B 站《动手学深度学习 PyTorch 版》、Stanford CNN 课程。
- **算法平台**：OI Wiki、QOJ、Codeforces。
- **PDF**：北京大学计算机基础科学与开发手册、人工智能基础知识手册。
- **个人项目**：Vibe Coding Lab。
- **飞书**：PyOHPlus 知识空间；以及 AI 课程清单第 20 项附带的沐曦 AI4S 学习环境和学习指南。

### 目前无法直接核验内容的飞书空间

- **PyOHPlus 飞书知识空间**：[打开你提供的飞书 Wiki 空间](https://pyohplus.feishu.cn/wiki/space/7694585317323558068?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home)。出处：用户提供｜你在本次消息中提供。
- 说明：当前环境无法读取该空间内部目录，因此我只把它登记为“用户提供的待筛选资源入口”，没有臆测里面有哪些课程，也没有把未知内容列成必修。你后续把目录导出或截图发来，再逐项归入阶段。

### Datawhale 课程清单原始来源索引

- **Happy-LLM：从零开始构建大模型**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 1 项。
- **LLM Algo-LeetCode：模型架构与训练方向**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 2 项。
- **LLM Algo-LeetCode：后训练优化方向**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 3 项。
- **LLM Algo-LeetCode：推理优化方向**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 4 项。
- **LLM Algo-LeetCode：算子优化方向**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 5 项。
- **DeepAgents in Action：从零构建生产级 Agent**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 6 项。
- **Easy Data × AI：构建知识与记忆驱动的 AI 应用**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 7 项。
- **Hello-Agents 入门篇：从零学习智能体**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 8 项。
- **Hello-Agents 进阶篇：构建智能体框架**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 9 项。
- **RAG 技术全栈指南**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 10 项。
- **FDE 书籍 1 共读：《企业本体论：人人都是 FDE》**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 11 项。
- **FDE 书籍 2 共读：《FDE：人工智能时代的客户价值交付》**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 12 项。
- **Easy-Vibe：AI 编程与应用开发入门**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 13 项。
- **Nailongbot：从零开始组装设计桌面陪伴机器人**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 14 项。
- **Hello-GPU：从 GPU 入门到 Agent 优化**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 15 项。
- **Hello-ROCm：零基础入门 ROCm**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 16 项。
- **GGUF 量化内幕**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 17 项。
- **C++ LLM Engine：从零构建 C++ LLM 推理引擎**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 18 项。
- **AI for Science**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 19 项。
- **沐曦 AI4S 实战营**：用户提供｜上传的《AI课程清单_分类与优先级》HTML 第 20 项。

## 你提供的资源总索引

### 计算机基础与算法
- [CSDIY｜CS 自学指南](https://csdiy.wiki/) — 用户提供的课程导航总入口。
- [OI Wiki](https://oi-wiki.org/) — 用户提供；算法/数据结构查询型 Wiki。
- [QOJ](https://qoj.ac/) — 用户提供；在线评测与竞赛平台。
- [Codeforces](https://codeforces.com/) — 用户提供；题库与竞赛平台。

### AI 与视觉资源
- [OpenCV](https://docs.opencv.org/) — 用户提供的参考资源截图。
- [Pillow](https://pillow.readthedocs.io/) — 用户提供的参考资源截图。
- [Hugging Face Hub](https://huggingface.co/) — 用户提供的参考资源截图。
- [ModelScope](https://www.modelscope.cn/) — 用户提供的参考资源截图。
- [B 站《动手学深度学习 PyTorch 版》系列](https://space.bilibili.com/1567748478/channel/seriesdetail?sid=358497) — 课程名称来自用户参考资源截图；当前可访问系列入口由 ChatGPT 补充。
- [Stanford CS231n 官方课程](https://cs231n.stanford.edu/2020/) — 用户截图提到 Stanford CNN 课程；当前官方入口由 ChatGPT 补充。

### 飞书资源
- [PyOHPlus 飞书知识空间](https://pyohplus.feishu.cn/wiki/space/7694585317323558068?ccm_open_type=lark_wiki_spaceLink&open_tab_from=wiki_home) — 用户提供；内部内容尚未读取。
- [沐曦 AI4S 学习环境](https://yuanzhen.feishu.cn/docx/Jy7BdMx7DoIqQVxKXOzczaYkn7d) — 用户提供；来自课程清单第 20 项。
- [沐曦 AI4S 学习指南](https://yuanzhen.feishu.cn/wiki/OAJswmIFbiP3eSk2PGacwsi4nhb) — 用户提供；来自课程清单第 20 项。

## 两本 PDF 的总阅读顺序

| 时间 | 《计算机基础科学与开发手册》 | 《人工智能基础知识手册》 |
|---|---|---|
| 第 1–3 个月 | 第 1–3 章、第 5 章、附录 C；第 6 章按需 | 先读前言，建立 AI 发展脉络；不要求深读数学与模型章节 |
| 第 4–6 个月 | 第 7–10 章、附录 A；附录 B 选读 | 暂时不作为主线，必要时查数学术语 |
| 第 7–9 个月 | 需要时回看附录 A 的数值表示、内存与缓存 | 第 1–2 章：数学基础与机器学习基本过程 |
| 第 10–12 个月 | 需要时回看编译、缓存与系统调用 | 第 3–5 章：CNN、RNN、Transformer |
| 第 13–15 个月 | 按推理系统问题回看附录 A | 第 5、7、8 章：Transformer、生成模型、SFT/RLHF |
| 第 16–18 个月 | 按机器人系统问题回看 Linux、系统基础 | 第 7.6.2、8.5.2：机器人动作生成与机器人控制 |
| 第 19–24 个月 | 按论文问题回看系统部分 | 按论文主题回看 Transformer、生成模型、强化学习与后训练 |

## 这份 Wiki 的使用原则

1. 每个阶段只选一门主课程和一个实践任务，不要把所有选修都同时打开。
2. 课程看完不算完成：必须留下代码、实验、报告、架构图或可复现结果。
3. 先用用户提供的资料；当资料存在缺口时，再使用标注为 ChatGPT 推荐的补充资源。
4. CSDIY 是课程导航，不是要求你把目录全部刷完；本 Wiki 只选与你目标相关的条目。
5. OI Wiki、QOJ、Codeforces 是算法辅助练习，不应挤占 Python、系统、AI 工程和模型学习主线。
6. 飞书空间内容尚未核验的部分不列为必修，避免把未知资源误当成已审查课程。

<small>整理与来源核验日期：2026-11-23。路线安排属于学习规划建议；课程版本、作业和环境要求以各课程官方页面为准。</small>