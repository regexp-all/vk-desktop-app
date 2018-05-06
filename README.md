# Клиент ВКонтакте для Windows и Linux
У проекта есть [группа ВКонтакте](https://vk.com/vk_desktop_app)  
А также [беседа в Telegram](https://t.me/vkdesktopteam)
## Возможности
* Прослушка музыки без рекламы и ограничений
## Сборка
Для сборки должен быть установлен `electron-packager` для вашей платформы.
### Windows
1. Скачайте [resources][res_win] для Windows
2. Создайте папку в удобном для вас месте и поместите туда папку app из скачанного resources
3. в созданной папке (не app) откройте командную строку (Shift+ЛКМ - Открыть окно команд)
4. Введите там `electron-packager ./app/ "build-*arch*" --platform win32 --arch *arch* --electronVersion 2.0.0`  
где `*arch*` - `ia32` (32 бита) или `x64`
### Linux
1. Скачайте [resources][res_linux] для Linux
2. Создайте папку в удобном для вас месте и поместите туда папку app из скачанного resources
3. в созданной папке (не app) откройте консоль
4. Введите там `electron-packager ./app/ "build-*arch*" --platform linux --arch *arch* --electronVersion 2.0.0`  
где `*arch*` - `ia32` (32 бита) или `x64`
### MacOS
1. Скачайте [resources][res_mac] для MacOS
2. Создайте папку в удобном для вас месте и поместите туда папку app из скачанного resources
3. в созданной папке (не app) откройте консоль
4. Введите там `electron-packager ./app/ "build-x64" --platform darwin --arch x64 --electronVersion 2.0.0`

[res_win]: https://github.com/danyadev/vk-desktop-app/releases/download/v0.5.1/res-windows.zip
[res_linux]: https://github.com/danyadev/vk-desktop-app/releases/download/v0.5.1/res-linux.zip
[res_mac]: https://github.com/danyadev/vk-desktop-app/releases/download/v0.5.1/res-mac.zip
