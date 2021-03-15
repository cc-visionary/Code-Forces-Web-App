import requests
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.chrome.options import Options

from datetime import datetime as dt
import time
import re
import os
import pandas as pd
import threading
import sys
import xlsxwriter
import pickle

# Converts Timedelta into Seconds (ex. 00:01:31.2134 -> 91)
def convertToSec(time):
    """
    Converts a time in a format of Hour.Minute.Second to seconds

    Parameters
    ----------
    time : datetime.datetime (required)
        datetime.datetime objects with a format of Hour.Minute.Second which will be converted into a string then to seconds

    Returns
    ---------------------------
    int
        total seconds of the converted hour.minute.second
    """
    str_time = str(time).split(':')
    return int(str_time[0]) * 360 + int(str_time[1]) * 60 + int(str_time[2][:2])

# Logs the error to easily see where errors occured
def logError(message, url='', e=''):
    """
    Logs the error using the message, url, and exception error to a error_log.txt file

    Parameters
    ----------
    message : string (required)
        description of the error

    url : string (optional)
        url where the error occured

    e : str(Exception) (optional)
        Error Exception that occured
    """
    with open('error_log.txt', 'a') as f:
        f.write('{}|{}|{}\n'.format(message, url, e))

# Goes to the URL
def getPage(driver, url):
    """
    The driver goes to the page designated by the URL

    Parameters
    ----------
    driver : chromedriver (required)
        the driver that will be used

    url : string (required)
        http url that the driver will be directed to
    """
    try:
        driver.get(url) # gets the URL
        pickle.dump( driver.get_cookies() , open("cookies.pkl","wb"))
    except Exception as e:
        print('\tERROR: Failed to load page ' + url + '\n', e)
        logError('Error loading the page', url, e)
        
# Scrolls to the Bottom of the Page
def scrollToBottom(driver):
    """
    Scrolls to the bottom of the page to load the informations that will not be loaded unless you scroll

    Parameters
    ----------
    driver : chromedriver (required)
        the driver that will be scrolled on
    """
    scroll = 0         # set scroll to 0px/top of the page (default) which will later on allow us to navigate the scrolling of the website
    scrollValue = 800  # constant incrementor (meaning we go down 800px in a page)
    while(scroll < driver.execute_script("return document.body.scrollHeight")): # gets the scrollheight of the page and continues to loop until it hasn't reach the bottom of the page
        scroll += scrollValue  # increment scroll by scrollValue
        driver.execute_script("window.scrollTo(0, {});".format(scroll)) # executes a javascript command to scroll to a specific area which in this case is [scroll]
        time.sleep(0.2)        # wait for 0.2 sec to prevent it from scrolling too fast (scrolling too fast will sometimes give us errors)


# Sets up chromeOptions for the Web Driver Settings
def settingDriverOptions():
    """
    Sets up the chrome options for the chrome web driver

    Returns
    -------
    object
        selenium.webdriver.chrome.options.Options() object
    """
    # webdriver options
    chromeOptions = Options()
    chromeOptions.add_argument('--kiosk')                          # sets the headless browser into full screen mode
    # chromeOptions.add_argument('--headless')                       # opens the browser silently (hides it, if you enable this, make sure to disable kiosk)
    # chromeOptions.add_argument('--log-level=3')                    # stops the headless browser's logging features
    # chromeOptions.add_argument('blink-settings=imagesEnabled=false') # set loading images to be false (for faster loading)
    # chromeOptions.add_argument('--no-sandbox')                     # required when running as root user. otherwise you would get no sandbox errors. 
    # chromeOptions.add_argument('--disable-extensions')
    # chromeOptions.add_argument('--profile-directory=Default')
    # chromeOptions.add_argument("--incognito")
    # chromeOptions.add_argument('--ignore-certificate-errors')
    # chromeOptions.add_argument("--disable-plugins-discovery")
    chromeOptions.add_argument("--user-data-dir=chrome-data")
    chromeOptions.page_load_strategy = 'normal'

    return chromeOptions

# Runs the driver
def runDriver(chromeOptions):
    """
    Runs/Open the chrome web driver passing it the chromeOptions options

    Parameters
    ----------
    driver: chromedriver (required)
        the driver that will be scrolled on

    Errors
    ------
    Message : session not created: This version of ChromeDriver only supports Chrome version 81
        Enter the command "sudo apt-get install libsqlite3-dev chromium-driver" on the terminal
        Solution taken from: https://blog.toshima.ru/2019/12/20/fix-chromedriver-only-supports-chrome-version.html   

    Returns
    -------
    object
        selenium.webdriver.Chrome() for further usage and manipulation
    """
    try:
        driver = webdriver.Chrome('./chromedriver/chromedriver', options=chromeOptions, service_args=['--verbose', '--log-path=/tmp/chromedriver.log']) # opens the headless browser
        try:
            cookies = pickle.load(open("cookies.pkl", "rb"))
            for cookie in cookies:
                driver.add_cookie(cookie)
        except:
            pass
    except Exception as e:
        print('ERROR: Failed to open Chrome Web Driver...\n', e) # outputs the following if it failed to load 
        logError('Error failed to open chrome web driver', '', e)
        input("Press any key to exit...")
        exit()
    return driver # returns the driver for further usage

# Close the Driver
def closeDriver(driver):
    """
    Closes the driver

    Parameters
    ----------
    driver : chromedriver (required)
        closes the driver through calling 'driver.close()'
    """
    try:
        driver.close()
    except Exception as e:
        print('ERROR: Something occured while closing the driver...\n', e)
        logError('Error closing the driver', '', e)

# Uses RegEx to figure out whether or not there are units (ml or oz) in the given string
def hasUnits(input): 
    """
    Tests if a string is a unit or not
    
    Parameters
    ----------
    input : string (required)
        a string that will be tested

    Returns
    -------
    bool
        True: input string is a unit
        False: input string is not a unit
    """
    units = [
        'g',
        'mg',
        'fl',
        'ml',
        'oz',
        'wipe',
        'wipes',
        'cloth',
        'cloths',
        'sheet',
        'sheets',
        'packed cloth',
        'pads',
        '" w',
        '" l',
        'l',
        'capsule',
        'capsules',
        'fl oz',
        'mm'
    ]
    pattern = r'(\d+.\d+|\d+)(| )(%s)' % '|'.join(units)
    return bool(re.search(pattern, input)) # basically returns True if string contains unit formats

# Change Directory with Error Handling
def changeDirectory(dirName):
    """
    Go to a different directory. Outputs an error if the directory doesn't exist

    Parameters
    ----------
    dirName : int (required)
        the name of the directory to go to

    Returns
    -------
    bool
        True: Successfully went to the desired directory
        False: Failed to go to the desired directory (most probably because the directory doesn't exist)

    Note
    ----
    When using this, always remember to go back to the previous/default directory
    so that we can prevent unexpected errors to occur
    """
    try:
        os.chdir(dirName)
        return True
    except Exception as e:
        print('\tERROR: directory "{}" doesn\'t exist...\n'.format(dirName), e)
        logError('Error something wrong with directory (does it exist?)', dirName, e)
        return False

def openURL(url, headers = {"User-Agent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36'}, sleep_sec=0):
    """
    Opens/Access the URL then returns a bs4.BeautifulSoup class
    
    Parameters
    ----------
    url : string (required)
        http url that is intended to be opened/accessed

    headers : dict (optional)
        contains the header settings for the request

    sleep_sec : int (optional)
        the number of seconds to wait for the website to load

    Returns
    -------
    object
        returns a bs4.BeautifulSoup object for further data manipulation
    """
    
    loaded = False       # tells us whether the page has loaded or not
    reloadCount = 0      # counts how many times we've tried to load the page
    max_reloadCount = 10 # the maximum amount of times for the program to reload
    wait_for_reload = 10 # the amount of time it takes for the program to reload
    soup = -1
    while(loaded == False and reloadCount < max_reloadCount):
        try:
            try:
                response = requests.get(url, headers=headers) # goes to the url (ex. https://www.sephora.com/ca/en/shop/face-makeup?pageSize=300)
                time.sleep(sleep_sec)
                loaded = True
                soup = BeautifulSoup(response.text, 'html.parser')
                response.close()
            except requests.exceptions.RequestException as e:
                notifyUser('Reloading the page', 'Failed to load %s' % url)
                reloadCount += 1  # increment reload count
                time.sleep(wait_for_reload) # wait for [wait_for_reload] (the time we designate for it to wait until reload)
                print('\tFailed to load, now restarting, ', e)
        except Exception as e:
            notifyUser('Something happened while loading the page', 'Failed to load %s' % url)
            logError('Failed to load the page', url, e)
            print('\tFailed to load the page')
            break
    if(reloadCount == 10):
        notifyUser('Reloaded 10 times but still failed', 'Failed to load %s' % url)
        print('\tERROR: {} failed to load...'.format(url))
        logError('ERROR website failed to load', url, '')    
    return soup

def notifyUser(title="Title of the notification", message="This is a notification"):
    """
    Notifies the user by putting up a notification bar using your title and message

    Parameters
    ----------
    title : string (optional)
        the title that the notification will have

    message : string (optional)
        the message that the notification will have

    Example
    -------
    >>> notifyUser('Scraper is finished', 'Check it now!') # puts up a notification bar telling the user the scraper is finished
    """
    try:
        os.system('notify-send "%s" "%s"' % (title, message))
    except Exception as e:
        logError('Failed to notify the user...', '', e)
        print('Failed to notify the user...')

def multipleSub(string, subs, lower=False):
    """
    Replaces/Substitutes multiple a values with values correspondeing to each other inside string using re.sub function
    
    Arguments
    ---------
    string: str
        the string which will be used to make changes on
        
    subs: array of 2-indexed array of strings
        An array which will contain an array with 2 values namely:
            Index 0: contains the string that will be replaced
            Index 1: contains the string that will replace the value to be replaced(Index 0)
    
    lower: bool
        determines
    
    Returns
    -------
    str
        the string result of the replacements/substitutions
        
    Example
    -------
    >>> multipleSub('Are you fine?!?', [['?', ''], ['!', '']])
    # returns: 'Are you fine' 
    
    >>> multipleSub('$20.', [['$', ''], ['.', '.00']])
    # returns '20.00'
    """
    if(lower): # turns all the strings into lower case
        string = string.lower()
        
    assert type(subs) is list
    for sub in subs:
        if(len(sub) == 2 and type(sub) is list):
            string = re.sub(sub[0], sub[1], string)
        else:
            print('Please make sure that each array has 2 index')
            raise IndexError()
    return string
