from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import ElementClickInterceptedException
import time
from configs import courses, subjects, select_div

targetTime = "2024-08-29 08:50:00"

def getTime():
    return time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())

def isOnTime(currentTime: str):
    return currentTime==targetTime

option = webdriver.EdgeOptions()
option.add_experimental_option("debuggerAddress", "127.0.0.1:9222")
driver = webdriver.Edge(options=option)
driver.implicitly_wait(10)
#driver.get("https://www.bjbzszxy.com/desktop/app-desktop/")
print("waiting......")
while True:
    if isOnTime(getTime()):
        break
    else: 
        continue

#select_button = driver.find_element(By.XPATH, select_div)
#select_button.click()
#time.sleep(1)
#driver.execute_script("window.open();")
#time.sleep(2)
#print(driver.window_handles)
#driver.switch_to.window(driver.window_handles[2])
#driver.switch_to.window(driver.window_handles[1])
#driver.get("http://bjsdbzx.bjbzszxy.com/xsxk/application/xk/studentParticipateElective/studentSelectCourse/studentSelectCourse.jsp?screen=full&__time__=1724891150312")
#time.sleep(2)
while True:
    for subject in subjects:
        print(f"{subject}:{courses[subject]}")
        button = driver.find_element(By.XPATH, courses[subject])
        try:
            button.click()
            print(f"{subject} selected!")
        except ElementClickInterceptedException as e:
            print(f"button disabled:{e}")
            continue