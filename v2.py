import requests
import logging
import threading
from configs_v2 import *
import time
from datetime import datetime
logging.basicConfig(level=logging.INFO)

targetTime = "2026-02-17 08:45:45"
timeFormat = "%Y-%m-%d %H:%M:%S"

def getTime() -> str:
    return time.strftime(timeFormat, time.localtime())


def isOnTime(currentTime: str):
    return currentTime == targetTime

def isPastTime(currentTime: str, targetTime: str) -> bool:
    current = datetime.strptime(currentTime, timeFormat)
    target = datetime.strptime(targetTime, timeFormat)
    return current > target

def getRemainingTime(time_str1: str, time_str2: str, time_format: str) -> str:
    dt1 = datetime.strptime(time_str1, time_format)
    dt2 = datetime.strptime(time_str2, time_format)
    delta = dt2 - dt1
    total_seconds = abs(delta.total_seconds())
    hours = int(total_seconds // 3600)
    minutes = int((total_seconds % 3600) // 60)
    seconds = int(total_seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

def sendRequest(params: dict[str, str|int]) -> None:
    url = "https://bjsdbzx.bjbzszxy.cn/xsxk/studentElective/redisStudentSelectCourse.do"
    headers = {
        "User-Agent": user_agent,
        "Cookie": cookie
    }
    while True:
        res = requests.post(url, data=params, headers=headers)
        logging.info(f"Course ID: {params['courseId']} : {res.text}")

while True:
    if isPastTime(getTime(), targetTime):
        break
    else:
        print(
            f"\r{getRemainingTime(getTime(), targetTime, timeFormat)}", flush=True, end="")
        continue

for courseId in coursesId:
    params = {
        "termId": termId,
        "courseId": courseId,
        "versionNum": versionNum,
        "force": force
    }
    threading.Thread(target=sendRequest, args=(params,)).start()




