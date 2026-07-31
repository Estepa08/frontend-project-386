# Video Meeting Booking

![Fullstack](https://img.shields.io/badge/Fullstack-Приложение-2ea44f?style=for-the-badge)

[![CI](https://github.com/Estepa08/frontend-project-386/actions/workflows/ci.yml/badge.svg)](https://github.com/Estepa08/frontend-project-386/actions/workflows/ci.yml)
[![Hexlet](https://github.com/Estepa08/frontend-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Estepa08/frontend-project-386/actions)

![React](https://img.shields.io/badge/-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white)
![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Playwright](https://img.shields.io/badge/-Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

Демо: [frontend-project-386-production.up.railway.app](https://frontend-project-386-production.up.railway.app)

---

Упрощённый сервис бронирования времени по мотивам Cal.com. Владелец публикует типы событий (название, описание, длительность) и рабочие часы, гость выбирает тип события, свободный слот в окне 14 дней и записывается на встречу. Вход — выбор роли на стартовой странице без аккаунтов.

---

## 🚀 Возможности

- **Выбор роли** — стартовая страница: «Владелец» (управление) или «Пользователь» (бронирование), роль сохраняется между сессиями
- **Публичное бронирование** — без регистрации и авторизации
- **Типы событий** — владелец создаёт события с названием, описанием и длительностью в минутах
- Окно записи **14 дней** с защитой от пересечений слотов
- Календарь со свободными датами и слотами
- Настройка рабочего графика по дням недели
- Список предстоящих встреч для владельца (все типы событий в одном списке)
- Отмена и редактирование встреч

---

## 🛠️ Стек

| Слой | Технологии |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Router v7 |
| **State** | TanStack Query v5 (серверное), Zustand v5 (клиентское) |
| **Формы** | React Hook Form + Zod |
| **Backend** | Node.js, Express, TypeScript |
| **Контракт** | TypeSpec → OpenAPI → openapi-typescript (design-first) |
| **Тесты** | Vitest (интеграционные), Playwright (e2e) |
| **CI/CD** | GitHub Actions (typecheck → lint → test → e2e → release) |
| **Инфраструктура** | Docker (multi-stage), Railway |

---

## 💡 О процессе разработки

Этот проект — демонстрация осознанной работы с AI-инструментами.

**Что делал я:**
- Спроектировал архитектуру: design-first (TypeSpec), структуру API, стек
- Написал AGENTS.md — регламент для AI-агента: код-стайл, правила безопасности, конвенции коммитов, процессы
- Ставил задачи, ревьюил код, уточнял требования на каждом этапе
- Использовал скиллы агента под конкретные задачи: TDD, code review, shadcn, writing plans
- Настроил CI/CD, Docker, деплой

**Что делал AI-агент:**
- Генерацию кода в рамках заданных правил

---

## 🏗️ Архитектура

- **Design-first:** TypeSpec → OpenAPI → автогенерация типов — контракт как единый источник правды
- **Layered architecture:** API-слой → хуки → UI, однонаправленный поток данных
- **Без авторизации:** приложение не хранит аккаунты — роль (владелец/пользователь) выбирается на стартовой странице и хранится в localStorage
- **In-memory storage:** данные живут в памяти процесса (переживают только период жизни контейнера)
- **CI/CD:** typecheck → lint → unit/integration → e2e → Release Please (автоверсионирование)

---

## 📦 Быстрый старт

**Локально**

```bash
make dev   # сервер + клиент параллельно
```

Открой `http://localhost:5173` — клиент проксирует запросы `/api` на `http://localhost:3001`.

**Docker**

```bash
docker compose up --build
```

Открой `http://localhost:3001`.

> Приложение хранит данные в памяти. После перезапуска контейнера данные сбрасываются — это осознанное ограничение для демо-сервиса.

---

## 🧪 Тесты

```bash
make test       # интеграционные тесты сервера + юнит клиента
make test-e2e   # Playwright (9 сценариев)
make test-all   # всё вместе
```

---

## 📁 Структура проекта

```
client/          — React SPA
server/          — Express API
  main.tsp       — TypeSpec-контракт
  openapi.json   — сгенерированный OpenAPI
.github/         — CI/CD + Release Please
Dockerfile       — multi-stage сборка
AGENTS.md        — регламент для AI-агента
```

## 🔄 Обновление контракта

```bash
npm run generate --prefix server        # main.tsp → openapi.json
make generate-api                        # openapi.json → типы клиента
```
