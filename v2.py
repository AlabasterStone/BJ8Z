import requests
import logging
params = {
    "termId": "afd4339f93e84dcf8cc64bc616a17bf2",
    "courseId": "134a8f908a1946b0913ee1fdf85f3ecc",
    "versionNum": 3,
    "force": "force"
}

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0",
    "Cookie": ""
}
url = "http://bjsdbzx.bjbzszxy.cn/xsxk/studentElective/redisStudentSelectCourse.do"

res = requests.post(url, data=params, headers=headers)
logging.basicConfig(level=logging.INFO)
logging.info(f"{res.status_code}: {res.text}")
print(res.text)
