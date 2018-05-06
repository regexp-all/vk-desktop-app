# Клиент ВКонтакте для Windows и Linux
У проекта есть [группа ВКонтакте](https://vk.com/vk_desktop_app) и в [Telegram](https://t.me/vkdesktop)  
А также [беседа в Telegram](https://t.me/vkdesktopteam)
## Возможности
* Прослушка музыки без рекламы и ограничений
* Просмотр новостей
* Просмотр списка друзей и групп
## Сборка
Для сборки должен быть установлен `electron-packager` для вашей платформы.
### Windows
1. Склонируйте репозиторий: `git clone https://github.com/danyadev/vk-desktop-app.git`
2. В папке с репозиторием откройте командную строку
3. Введите там `electron-packager ./vk-desktop-app/ "windows-*arch*" --platform win32 --arch *arch* --electronVersion 2.0.0`  
где `*arch*` - `ia32` (32 бита) или `x64`
### Linux
1. Склонируйте репозиторий: `git clone https://github.com/danyadev/vk-desktop-app.git`
2. В папке с репозиторием откройте консоль
3. Введите там `electron-packager ./vk-desktop-app/ "linux-*arch*" --platform linux --arch *arch* --electronVersion 2.0.0`  
где `*arch*` - `ia32` (32 бита) или `x64`
### MacOS
1. Склонируйте репозиторий: `git clone https://github.com/danyadev/vk-desktop-app.git`
2. В папке с репозиторием откройте консоль
3. Введите там `electron-packager ./vk-desktop-app/ "macos" --platform darwin --arch x64 --electronVersion 2.0.0`
