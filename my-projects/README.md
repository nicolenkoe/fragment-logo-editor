# Мои проекты 1.6 — тестовая сборка

Сайт: https://nicolenkoe.github.io/fragment-logo-editor/my-projects/
APK: https://nicolenkoe.github.io/fragment-logo-editor/my-projects/my-projects-1.6.apk
Проверки по порядку: https://nicolenkoe.github.io/fragment-logo-editor/my-projects/checks-1.6.html

## Обновления

При каждом onResume (первый запуск и возвращение) проверяется releases.json без суточного или минутного ограничения. Выполняющиеся проверки объединяются в одну очередь с обязательной повторной проверкой после текущей работы. Скачивание — автоматически в фоне; предложение касается уже проверенного файла. Нажатие «Позже» не меняет канал и не запрещает скачивание последующих разрешённых версий.

Новая настройка stable_only_updates («Только стабильные версии») по умолчанию false, старое testing_updates не используется. False разрешает stable/testing/experimental; true — только stable. Выбирается наибольший versionCode с совместимыми minSdk/maxSdk/ABI, корректным HTTPS URL и SHA-256, withdrawn=false. Установка равной или более старой версии не предлагается. При отсутствии стабильных выводится отдельное сообщение.

Готовые APK сохраняются в приватном files/updates/<code>-<sha256>.apk, а не во временном кеше. При повторном использовании и перед установкой проверяются размер, SHA-256, пакет, номер, подпись, Android и ABI. Несовпадение блокирует установку; повреждённый кеш заменяется. Подписи сравниваются с установленным приложением через PackageManager. Передаётся временное read-only разрешение на единственный конкретный файл через закрытый ContentProvider. Установку подтверждает Android. Ключ подписи сохранён прежним и не опубликован.

Остальные функции и интерфейс не изменялись. Изменена только галочка обновлений и номер версии. Системная установка на телефоне ещё не проверена.

## Тесты без Android

```
javac -d /tmp/hub-update-tests android/src/com/nicolenkoe/hub/UpdatePolicy.java android/src/com/nicolenkoe/hub/UpdateEngine.java tests/UpdateEngineTest.java
java -cp /tmp/hub-update-tests UpdateEngineTest
```

26 проверок выбора, совместимости, кеширования, сетевых запросов, целостности и идентичности APK. Дополнительно реальный APK 1.6 прочитан aapt2/apksigner, сертификат сверен с 1.5, проверена подготовка и повторное использование через UpdateEngine. Это не заменяет проверку Android-установщика на устройстве.

Следующий выпуск: увеличить versionCode, подписать тем же ключом, загрузить новый неизменяемый файл, добавить в releases.json точные sizeBytes/sha256/minSdk/channel и описание. JSON и APK публиковать одним коммитом. Не менять байты APK уже опубликованного имени. projectThreads и additionalProjects сохранены.
