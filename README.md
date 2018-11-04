# add-all-calendars
슬랙 모든 팀원들의 구글 개인캘린더를 한 번에 추가합니다.

### 기술 및 환경
WebStorm, Node, Express, Axios, GCP Compute Engine, crontab, Google Calendar API, Slack API   

###  프로그램이 죽어도 재실행 되게 만들기
```
$ chmod 777 chkproc.sh
$ crontab -e
$ * * * * * /home/bsscco/add-all-calendars/chkproc.sh > /home/bsscco/add-all-calendars/crontab-chkproc.log 2>&1
```