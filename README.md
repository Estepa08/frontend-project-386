# Video Meeting Booking

![Fullstack](https://img.shields.io/badge/Fullstack-Приложение-2ea44f?style=for-the-badge)

[![CI](https://github.com/Estepa08/frontend-project-386/actions/workflows/ci.yml/badge.svg)](https://github.com/Estepa08/frontend-project-386/actions/workflows/ci.yml)
[![Hexlet](https://github.com/Estepa08/frontend-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Estepa08/frontend-project-386/actions)

![React](https://img.shields.io/badge/-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/-Express-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/-Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Playwright](https://img.shields.io/badge/-Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

Демо: [frontend-project-386-production.up.railway.app](https://frontend-project-386-production.up.railway.app)

---

SPA для бронирования видеовстреч. Две роли — организатор и клиент. Организатор настраивает график и типы встреч, клиент выбирает свободный слот и бронирует.

---

## 🛠️ Стек

| Слой | Технологии |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, React Router v7 |
| **State** | TanStack Query v5 (серверное), Zustand v5 (клиентское) |
| **Формы** | React Hook Form + Zod |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **БД** | PostgreSQL |
| **Контракт** | TypeSpec → OpenAPI → openapi-typescript (schema-first) |
| **Тесты** | Vitest (39 integration), Playwright (15 e2e) |
| **CI/CD** | GitHub Actions (typecheck → lint → test → e2e → release) |
| **Инфраструктура** | Docker (multi-stage), Railway |

---

## 🚀 Возможности

- Регистрация и аутентификация (JWT, httpOnly cookies, bcrypt)
- Настройка рабочего графика по дням недели
- Типы встреч: 15 или 30 минут, категории single/group/private
- Календарь со свободными датами и слотами — защита от пересечений
- Пошаговый визард бронирования (4 шага)
- Гостевые инвайты по email
- Дашборд со статистикой для админа
- Фильтрация встреч по статусу и дате

---

## 💡 О процессе разработки

Этот проект — демонстрация осознанной работы с AI-инструментами.

**Что делал я:**
- Спроектировал архитектуру: schema-first (TypeSpec), разделение на роли, структуру БД, стек
- Написал AGENTS.md — регламент для AI-агента: код-стайл, правила безопасности, конвенции коммитов, процессы
- Ставил задачи, ревьюил код, уточнял требования на каждом этапе
- Использовал скиллы агента под конкретные задачи: TDD, code review, shadcn, writing plans
- Настроил CI/CD, Docker, деплой

**Что делал AI-агент:**
- Генерацию кода в рамках заданных правил

Результат: production-ready fullstack-приложение за ~24 часа.

---

## 🏗️ Архитектура

- **Schema-first:** TypeSpec → OpenAPI → автогенерация типов — контракт как единый источник правды
- **Layered architecture:** API-слой → хуки → UI, однонаправленный поток данных
- **Security:** httpOnly cookies, rate limiting, Helmet CSP, bcrypt, Zod-валидация
- **Оптимистичные обновления:** отмена и изменение встреч без ожидания ответа сервера
- **CI/CD:** typecheck → lint → unit/integration → e2e → Release Please (автоверсионирование)

---

## 📦 Быстрый старт

**Локально**

```bash
cp .env.example .env
```

Открой `.env` и впиши свои значения:
- `DATABASE_URL` — подключение к твоему PostgreSQL
- `JWT_SECRET` — любая строка

```bash
make dev   # сервер + клиент параллельно
```

**Docker**

```bash
docker compose up --build
```

**Деплой на Railway**

Переменные `DATABASE_URL`, `JWT_SECRET`, `PORT` задаются в дашборде Railway (раздел Variables). `.env` не нужен.

---

## 🧪 Тесты

```bash
make test       # юнит + интеграционные (39)
make test-e2e   # Playwright (15 сценариев)
make test-all   # всё вместе
```

---

## 📁 Структура проекта

```
client/          — React SPA
server/          — Express API + Prisma
  main.tsp       — TypeSpec-контракт
  prisma/        — схема БД + миграции
.github/         — CI/CD + Release Please
Dockerfile       — multi-stage сборка
AGENTS.md        — регламент для AI-агента
```
