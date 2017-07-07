[![Chrome Web Store](https://img.shields.io/chrome-web-store/d/ckidfgngmgahddfkgmhcbamconecldfi.svg)](https://chrome.google.com/webstore/detail/iems/ckidfgngmgahddfkgmhcbamconecldfi?hl=en-US)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/ckidfgngmgahddfkgmhcbamconecldfi.svg)](https://chrome.google.com/webstore/detail/iems/ckidfgngmgahddfkgmhcbamconecldfi?hl=en-US)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ckidfgngmgahddfkgmhcbamconecldfi.svg)](https://chrome.google.com/webstore/detail/iems/ckidfgngmgahddfkgmhcbamconecldfi?hl=en-US)
[![Travis](https://img.shields.io/travis/django-wong/iems.svg)](https://travis-ci.org/django-wong/iems)

### IEMS JETPACK
这个项目只是为了偷懒顺便尝试一下ES7新特性

#### 安装
1. 从应用商店安装，地址： [iems - Chrome Web Store](https://chrome.google.com/webstore/detail/iems/ckidfgngmgahddfkgmhcbamconecldfi?hl=en-US)
2. 从本地安装
```
$ git clone https://gitlab.com/django-wong/iems.git && cd ./iems
$ npm install
$ gulp build
```
打开Chrome设置 -> 扩展程序 -> 勾选`开发模式` 
-> 点击 `载入正在开发的扩展程序` -> 选择iems/dist目录


#### Known issues
1. 为了降低性能消耗，Chrome闹钟的检测频率为大约每分钟一次。所以在设置自动填工作量时，尽量选择当前系统时间前后两分钟以外的时间。[see here](https://developer.chrome.com/extensions/alarms#method-create)