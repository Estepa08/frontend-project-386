# Video Meeting Booking

[![CI](https://github.com/Estepa08/frontend-project-386/actions/workflows/ci.yml/badge.svg)](https://github.com/Estepa08/frontend-project-386/actions/workflows/ci.yml)
[![Hexlet](https://github.com/Estepa08/frontend-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/Estepa08/frontend-project-386/actions)

SPA для бронирования видеовстреч. Две роли — организатор и клиент. Организатор настраивает график работы и типы встреч, клиент выбирает свободное время и бронирует.

Задеплоено: [frontend-project-386-production.up.railway.app](https://frontend-project-386-production.up.railway.app)

**Стек:** React 19 + TypeScript + Vite / Express + Prisma + PostgreSQL / Tailwind CSS + shadcn/ui / TanStack Query + Zustand / Docker

---

### О проекте

Я спроектировал приложение как учебный проект, но подошёл к нему как к промышленному: schema-first (TypeSpec → OpenAPI), тесты, CI/CD, Docker, security.

Генерацию кода делал AI-агент, но я полностью контролировал процесс. Написал для него `AGENTS.md` — документ с правилами архитектуры, код-стайла, безопасности и процессов. Каждый этап начинался с постановки задачи, заканчивался ревью. Использовал скиллы агента под конкретные задачи: TDD, code review, shadcn.

В итоге за ~24 часа получилось полноценное приложение с аутентификацией, проверкой пересечений, визардом бронирования, тестами, CI/CD и докером.

### Быстрый старт

```bash
cp .env.example .env  # указать DATABASE_URL и JWT_SECRET
make dev               # сервер + клиент параллельно
# Или Docker:
docker compose up --build
```

### Тесты

```bash
make test       # юнит + интеграционные (39 тестов)
make test-e2e   # Playwright (15 e2e-сценариев)
```

### Что внутри

- Регистрация и логин (JWT, httpOnly cookies)
- Настройка рабочего графика по дням недели
- Типы встреч: 15 или 30 минут, категории single/group/private
- Календарь со свободными датами и слотами — система не даст забронировать поверх занятого
- Пошаговое бронирование: выбор админа → тип встречи → дата и время → подтверждение
- Дашборд со статистикой для админа
- Docker multi-stage, CI/CD (GitHub Actions), автоматические релизы (Release Please)
