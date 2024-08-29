# BJ8Z
北京八中自动抢课 使用selenium浏览器自动化

Usage:
1.配置
右键点击你想选的课的选择元素，复制XPath
<img width="1081" alt="image" src="https://github.com/user-attachments/assets/128e2fdb-ad1c-403a-a8a7-558f959d78b4">
将`configs.py`中的值替换为复制的XPath，对应课程科目

2.运行
Edge Browser: 切换到浏览器文件目录，在powershell中输入`./msedge.exe --remote-debugging-port=9222 --user-data-dir="你想存储profile的路径"`
注意: `--user-data-dir`疑似是必须的，没有这个参数会因为未知原因无法启动remote debugging
在浏览器中打开选课页面，运行`main.py`
