# Coding Guidelines

## Komponenten

Eine Komponente besteht immer aus:

Component/

Component.jsx

Component.css

index.js

---

## Imports

Nutze ausschließlich Alias-Imports.

Beispiel:

```jsx
import Button from "@shared/ui/Button";
```

Keine relativen Pfade mit ../../../

---

## Struktur

Business Logic gehört nach

modules/

UI gehört nach

shared/ui

Layout gehört nach

core/layout

Rendering gehört nach

rendering/