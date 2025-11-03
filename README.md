# PMP - Professional Modular Project

## 🌐 promodular.danielsoltero.dev

This project is the **PMP (Professional Modular Project)** by Daniel Soltero, designed as:

* Application with scalable architecture at all levels, serving as a foundation for professional projects
* Personal platform for practicing features, programming, and code best practices
* Professional project showcasing my work methodology, web functionality development, and Full-Stack development expertise

## 🛠 Tech Stack

**Frontend:** Angular 19
**Backend:** Symfony 6.4
**Database:** PostgreSQL
**Dev. Env:** Visual Studio Code + Extensions
**Extras:** Frameworks for design, such as Bootstrap, Angular Material, between others

---

## 📋 Main Function Requirements

###  MVP Functionalities

1. User Authentication: register, login and logout 
2. Different user roles
3. User / Module complete administration: CRUD options for management
4. Dashboard for dummy stats
5. Modular and scalable architecture for new modules and functionalities extension
6. API Integration

### Optional Functionalities

---

## 🏗 Project Architecture

### Backend: Symfony

```
backend/
├─ config/               
│   ├─ packages/          
│   ├─ routes/            
│   └─ services.yaml      
│
├─ migrations/            
│
├─ public/              
│   ├─ ...  
│   └─ index.php
│
├─ src/                   
│   ├─ Controller/        
│   │   ├─ Api/
│   │   │   ├─ UserController.php
│   │   │   ├─ PostController.php
│   │   │   └─ AuthController.php
│   │   │
│   │   └─ Admin/
│   │       ├─ DashboardController.php
│   │       └─ ...
│   │
│   ├─ Entity/            
│   │   ├─ User.php
│   │   ├─ Post.php
│   │   └─ ...
│   │
│   ├─ Repository/        
│   │   ├─ UserRepository.php
│   │   ├─ PostRepository.php
│   │   └─ ...
│   │
│   ├─ Service/           
│   │   ├─ UserService.php
│   │   ├─ MailService.php
│   │   └─ ...
│   │
│   ├─ Security/          
│   │   ├─ JwtAuthenticator.php
│   │   ├─ UserProvider.php
│   │   └─ Voter/
│   │
│   ├─ EventListener/     
│   ├─ Exception/        
│   ├─ DTO/               # Data Transfer Objects (for API)
│   ├─ Serializer/        
│   └─ Kernel.php
│
├─ tests/            
├─ translations/         
├─ var/                   
├─ vendor/               
├─ .env         
├─ .env.local                  
├─ composer.json
└─ symfony.lock

```

**Main concepts:**

* Independent modules.
* Separation of concerns: core → business rules, modules → implementation.
* Dependency injection and testing from the start.

### Frontend: Angular

```
frontend/
├─ node_modules/
├─ src/
│  ├─ app/
│  │  ├─ assets/
│  │  │  ├─ fonts/
│  │  │  ├─ img/
│  │  │  └─ libraries/
│  │  │
│  │  ├─ core/
│  │  │  ├─ guards/
│  │  │  ├─ interceptors/
│  │  │  ├─ models/
│  │  │  ├─ services/
│  │  │  └─ pipes/
│  │  │
│  │  ├─ shared/
│  │  │  ├─ components/
│  │  │  ├─ directives/
│  │  │  └─ pipes/
│  │  │
│  │  ├─ environments/
│  │  │  ├─ environment.dev.ts
│  │  │  └─ environment.prod.ts
│  │  │
│  │  ├─ pages/
│  │  │  ├─ admin/
│  │  │  │  ├─ _components/
│  │  │  │  ├─ login-admin/
│  │  │  │  ├─ user-admin/
│  │  │  │  ├─ post-admin/
│  │  │  │  ├─ admin.module.ts
│  │  │  │  └─ admin.routes.ts
│  │  │  │
│  │  │  └─ client/
│  │  │      ├─ _components/
│  │  │      ├─ home/
│  │  │      ├─ register/
│  │  │      ├─ login/
│  │  │      ├─ profile/
│  │  │      ├─ post/
│  │  │      │   ├─ create/
│  │  │      │   └─ view/
│  │  │      ├─ client.module.ts
│  │  │      └─ client.routes.ts
│  │  │
│  │  ├─ config/
│  │  │  ├─ api.config.ts
│  │  │  └─ constants.ts
│  │  │
│  │  ├─ app.component.*
│  │  ├─ app.config.ts
│  │  └─ app.routes.ts
│  │
│  ├─ index.html
│  ├─ main.ts
│  └─ styles.css
│
├─ tests/
│
├─ angular.json
├─ package.json
├─ tsconfig.json
└─ README.md
```

**Main concepts:**

* Lazy loading in all pages
* Small and reusable components
* Documentation of props, events and services

---

## 🗄 Main Data Models Structure

### User

| Field       | Type      | Description        |
| ------------- | --------- | ------------------- |
| id            | UUID      | UNIQUE identifier |
| name          | String    | Complete name    |
| email         | String    | UNIQUE Email         |
| password | String    | Hashed Password  |
| role          | Array    | ["ROLE_ADMIN","ROLE_EDITOR","ROLE_USER"]       |
| created_at    | Timestamp | Creation date      |
| updated_at    | Timestamp | Update date      |

### Post

| Field      | Type      | Description              |
| ---------- | --------- | ------------------------ |
| id         | UUID      | UNIQUE identifier        |
| user_id    | UUID      | User foreign key         |
| message    | String    | Notification text        |
| read       | Boolean   | Read / unread status     |
| created_at | Timestamp | Creation date            |
| updated_at | Timestamp | Update date            |

### Doctrine migrations

---

## 📅 Project Roadmap

# PMP – Professional Modular Project Roadmap

## Week 1-2: Design & Project Setup 🎯
- Analyze project requirements to define an optimal stack, technologies, and infrastructure for a simple, modular, and scalable personal project.  
- Choose the technical stack and development tools.  
- Configure the database and set up the development environment (VS Code, dependencies, and local services).  
- Initialize the GitHub repository and create the initial `README.md` with the project roadmap to guide development.

---

## Week 3-4: Authentication 🔑

### Backend
- Set up the authentication module structure in Symfony.  
- Implement `/register` endpoint with input validation.  
- Implement `/login` endpoint with JWT authentication.  
- Implement `/logout` endpoint.  
- Write unit tests for register and login workflows.

### Frontend
- Create login form component.  
- Create register form component.  
- Implement form validation and error handling.  
- Guard private routes to ensure secure access.  
- Write unit tests for form components.

---

## Week 5-6: User Management 👥

### Backend
- Create `User` entity with fields: `id`, `name`, `email`, `password`, `roles`, `created_at`, `updated_at`.  
- Implement CRUD endpoints for users (create, list, update, delete).  
- Implement role handling: `ROLE_USER`, `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`.  
- Write unit tests for user CRUD and role management.

### Frontend
- Create a users table with filtering and sorting functionality.  
- Build forms for creating and editing users.  
- Implement user deletion functionality.  
- Write unit tests for user components.

### Clean Code / Refactoring
- Apply naming conventions and SOLID principles.  
- Refactor backend services for modularity.  
- Refactor frontend components and services.

---

## Week 7-8: Posts / Scalable Content 📝

### Backend
- Create `Post` entity with fields: `id`, `user_id`, `title`, `content`, `tags`, `created_at`, `updated_at`.  
- Implement CRUD endpoints for posts.  
- Write unit tests for post CRUD and services.

### Frontend
- Build `PostList` component with dummy data.  
- Build `PostForm` component for creating and editing posts.  
- Implement `PostService` to connect frontend to backend.  
- Write unit tests for post components and services.

---

## Week 9-10: Dashboard 📊

### Backend
- Implement `/dashboard` endpoint with dummy statistics.  
- Include counts for total users and total posts.  
- Write unit tests for dashboard services.

### Frontend
- Build dashboard component with statistic cards.  
- Display total users and posts dynamically.  
- Write unit tests for the dashboard component.

### Clean Code / Refactoring
- Review code for SOLID principles and modular architecture.  
- Refactor shared services and helper utilities.

---

## Week 11-12: Integration & Deployment 🚀

### Integration
- Connect frontend and backend via REST API.  
- Implement guards and interceptors for JWT authentication.  
- Ensure input validation and comprehensive error handling.

### Deployment
- Dockerize backend and frontend applications.  
- Prepare production build for Angular.  
- Deploy project to server, Vercel, or Render.

### Documentation
- Update `README.md` with project description and instructions.  
- Document all endpoints and modules.  
- Write an article/blog: “How I Built My Professional Modular Boilerplate”.

---

## 💡 Optional / Future Enhancements
- Integrate external dummy APIs.  
- Add comments, likes, and tags on posts.  
- Implement role-based access control with Symfony Voters.  
- Add real-time statistics and analytics in the dashboard.

---

## 🚀 Final Objectives

* Create a **reusable modular project**.
* Demonstrate **Clean Code, clean architecture, and modularity**.
* Strengthen the **professional brand danielsoltero.dev**.

-Página web para cliente empezando de colombia -> España

-Escalable a futuro para posibles futuros inmuebles
Idea de crecimiento
-Información de contacto y de dirección externa
-WhatsApp
-Gestion de posible añadimiento de inmuebles
-CRUD -> Inmuebles


<https://hogar-ideal-hub.lovable.app>
<https://theboutiqueproperty.com/>
