import requests
from configs_v2 import *

def getCourseInfo():
    url = "http://bjsdbzx.bjbzszxy.cn/xsxk/studentElective/redisEnterStudentSelect.do"
    res = requests.get(url, headers={
        "User-Agent": user_agent,
        "Cookie": cookie
    }).json()
    for course in list(res["data"]["allCourseInfo"].values()):
        if(course["courseName"] == "B5网络安全实战营" or course["courseName"] == "B乒乓球" or course["courseName"] == "B2色粉画创作"):
            print(f"{course['courseName']}: {course['courseId']}")

getCourseInfo()