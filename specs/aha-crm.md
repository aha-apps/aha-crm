# AHA CRM — Especificación Funcional

## Identidad

- **Nombre:** AHA CRM
- **Tagline:** CRM sencillo para oficinas y freelancers
- **Perfil:** Lite (file://, doble clic)
- **Stack:** Alpine.js 3 + Dexie 3 + DaisyUI 4 + Tailwind Play CDN + Bootstrap Icons
- **Tema:** #2563eb (blue-600)
- **Branch:** main

## Propósito

Aplicación offline-first de CRM para profesionales independientes, contadores, abogados y pequeñas oficinas. Permite gestionar contactos, dar seguimiento a negocios, organizar tareas y visualizar el pipeline de ventas en kanban.

## DB Schema (Dexie)

```
contactos_crm: ++id, nombre, *telefono, *email, *empresa, *puesto, *createdBy, createdAt, updatedAt
negocios: ++id, *contactoId, nombre, *etapa, monto, *probabilidad, *createdBy, createdAt, updatedAt
tareas_crm: ++id, *negocioId, *contactoId, titulo, *fecha, *estado, *prioridad, *createdBy, createdAt, updatedAt
```

### Indexes adicionales

- contactos_crm: `&telefono` (unique)
- negocios: `*etapa`
- tareas_crm: `*estado`, `*prioridad`

## Módulos

### 1. Contactos (`#/contactos`)
- Lista con búsqueda por nombre, teléfono, empresa
- CRUD completo
- Campos: nombre (requerido), teléfono (requerido, único), email, empresa, puesto, notas
- Vista de detalle con negocios y tareas vinculadas

### 2. Negocios (`#/negocios`)
- Lista de oportunidades con monto y etapa
- CRUD completo
- Etapas: prospeccion, contacto, propuesta, negociacion, cerrado-ganado, cerrado-perdido
- Probabilidad sugerida según etapa

### 3. Tareas (`#/tareas`)
- Lista con filtros por estado y prioridad
- Estados: pendiente, en-progreso, completada
- Prioridad: baja, media, alta, critica
- Vincular a negocio y/o contacto

### 4. Kanban (`#/kanban`)
- Tablero con columnas por etapa
- Arrastrar negocios entre etapas (drag & drop)
- Totales por columna (monto + cantidad)

### 5. Reportes (`#/reportes`)
- Pipeline general (gráfica de barras apiladas)
- Tasa de conversión por etapa
- Negocios ganados vs perdidos (dona)
- Top contactos por monto total
- Exportar reporte como JSON

## Reglas de Negocio

- Al cerrar un negocio como "ganado", la probabilidad pasa a 100
- No se puede eliminar un contacto con negocios activos
- La etapa "cerrado-perdido" requiere motivo
- Tareas vencidas se marcan automáticamente como atrasadas
