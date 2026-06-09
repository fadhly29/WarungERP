# TODO - Development Roadmap

## Phase 1 - Project Setup

### Setup

- [ ] Create Next.js 15 Project
- [ ] Setup TypeScript
- [ ] Setup TailwindCSS
- [ ] Setup ESLint
- [ ] Setup Prettier
- [ ] Setup Husky

### Supabase

- [ ] Create Supabase Project
- [ ] Configure Auth
- [ ] Configure RLS
- [ ] Create Database Tables

### Deployment

- [ ] Connect Github
- [ ] Connect Vercel
- [ ] Setup Environment Variables

---

## Phase 2 - Authentication

### Login

- [ ] Email Login
- [ ] Magic Link Login

### User Management

- [ ] Owner Role
- [ ] Staff Role

---

## Phase 3 - Ingredient Module

### CRUD

- [ ] Create Ingredient
- [ ] Update Ingredient
- [ ] Delete Ingredient
- [ ] Search Ingredient

### Marketplace Sync

- [ ] Tokopedia Search
- [ ] Shopee Search
- [ ] Save Price Snapshot
- [ ] Average Price Engine

---

## Phase 4 - Recipe Builder

### Recipe

- [ ] Create Recipe
- [ ] Add Ingredients
- [ ] Edit Recipe

### Calculation

- [ ] Calculate HPP
- [ ] Recalculate On Price Change

---

## Phase 5 - Menu Management

### CRUD

- [ ] Create Menu
- [ ] Update Menu
- [ ] Delete Menu

### Auto Margin

- [ ] Margin Calculator
- [ ] Profit Calculator

---

## Phase 6 - Open PO

### Public Page

- [ ] Public Landing Page
- [ ] Product Catalog

### Order Form

- [ ] Customer Information
- [ ] Product Selection
- [ ] Quantity

### Admin

- [ ] Order Approval
- [ ] Status Tracking

---

## Phase 7 - Dashboard

### KPI

- [ ] Revenue
- [ ] HPP
- [ ] Profit
- [ ] Margin

### Charts

- [ ] Sales Chart
- [ ] Profit Chart
- [ ] Top Product Chart

---

## Phase 8 - UI/UX

### Design System

- [ ] Shadcn/UI
- [ ] TailwindCSS
- [ ] Aceternity UI
- [ ] Magic UI
- [ ] Dark Mode

### Pages

- [ ] Dashboard
- [ ] Ingredients
- [ ] Recipes
- [ ] Menus
- [ ] Purchase Orders
- [ ] Analytics

---

## Phase 9 - Production Ready

### Testing

- [ ] Unit Test
- [ ] Integration Test

### Security

- [ ] RLS Validation
- [ ] API Validation

### Optimization

- [ ] Caching
- [ ] Lazy Loading
- [ ] Image Optimization

---

# Recommended Tech Stack

## Frontend

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Shadcn/UI
- Lucide React

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

## State Management

- TanStack Query
- Zustand

## Forms

- React Hook Form
- Zod

## Charts

- Recharts

## Deployment

- Vercel

## CI/CD

- GitHub Actions

## Cost

- Rp0 (Free Tier)

---

# SaaS Architecture

User
↓
Next.js (Vercel)
↓
Supabase Auth
↓
PostgreSQL
↓
Supabase Storage

---

# Future Premium Features

- [ ] Inventory Management
- [ ] WhatsApp Integration
- [ ] Midtrans Payment
- [ ] QRIS Dynamic
- [ ] AI Price Prediction
- [ ] AI Demand Forecasting
- [ ] Multi Branch
- [ ] Supplier Portal
- [ ] Multi Tenant SaaS