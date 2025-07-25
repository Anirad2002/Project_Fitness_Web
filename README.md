# README

## Spis Treści
1. [Wstęp](#wstęp)
2. [Instalacja](#instalacja)
3. [Użycie](#użycie)
4. [Zależności](#zależności)

## Wstęp
Aplikacja to kompleksowa platforma zdrowia i fitness zbudowana przy użyciu Node.js i Express. Umożliwia użytkownikom rejestrację, logowanie, zarządzanie profilem, obliczanie BMI i PPM, śledzenie spożycia wody oraz resetowanie hasła. Backend wykorzystuje MongoDB do przechowywania danych i Nodemailer do funkcji e-mailowych.
## Instalacja
### Wymagane oprogramowanie
- Node.js (wersja 14.x lub nowsza)
- MongoDB (lokalnie lub zdalna baza danych)
### Kroki instalacji
1. **Zainstaluj zależności:**
    ``` 
    npm install express mongoose nodemailer express-session uuid ejs
    ```
2. **Zainstaluj MongoDB:**
    - Na systemie Windows:
      1. Pobierz instalator MongoDB z [oficjalnej strony](https://www.mongodb.com/try/download/community).
      2. Uruchom instalator i postępuj zgodnie z instrukcjami.
      3. Upewnij się, że MongoDB jest uruchomione jako usługa (sprawdź w `services.msc`).

    - Na systemie macOS:
      1. Zainstaluj Homebrew, jeśli jeszcze go nie masz:
          ```
          /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
          ```
      2. Zainstaluj MongoDB za pomocą Homebrew:
          ```
          brew tap mongodb/brew
          brew install mongodb-community@4.4
          ```
      3. Uruchom MongoDB:
          ```
          brew services start mongodb/brew/mongodb-community
          ```
4. **Skonfiguruj MongoDB:**
    - Upewnij się, że MongoDB działa lokalnie lub masz dostęp do zdalnej bazy danych.
    - Domyślny ciąg połączenia to `mongodb://localhost:27017/myapp`.
## Użycie
1. **Uruchom serwer:**
    ```
    node server.js
    ```
2. **Otwórz przeglądarkę i przejdź do `http://localhost:3000`.**
## Zależności
- express
- mongoose
- nodemailer
- express-session
- uuid
- ejs
