# Utilidades de BigInt

Este módulo proporciona utilidades para manejar la serialización y deserialización de `BigInt` en la aplicación.

## Funciones Disponibles

### `serializeBigInt(obj: any): any`
Convierte todos los `BigInt` y `Date` en un objeto a `string` para serialización JSON.

**Uso:**
```typescript
import { serializeBigInt } from '../shared/infrastructure/utils/bigint.utils';

const data = {
  id: BigInt(1),
  name: "Juan",
  user_id: BigInt(2),
  birthdate: new Date('1990-01-01'),
  created_at: new Date()
};

const serialized = serializeBigInt(data);
// Resultado: { id: "1", name: "Juan", user_id: "2", birthdate: "1990-01-01T00:00:00.000Z", created_at: "2024-01-01T12:00:00.000Z" }
```

### `deserializeBigInt(obj: any, fields?: string[]): any`
Convierte strings que representan números a `BigInt`.

**Uso:**
```typescript
import { deserializeBigInt } from '../shared/infrastructure/utils/bigint.utils';

const data = {
  id: "1",
  name: "Juan",
  user_id: "2"
};

const deserialized = deserializeBigInt(data, ['id', 'user_id']);
// Resultado: { id: BigInt(1), name: "Juan", user_id: BigInt(2) }
```

### `convertToBigInt(obj: any, idFields?: string[]): any`
Convierte campos específicos de un objeto a `BigInt`.

**Uso:**
```typescript
import { convertToBigInt } from '../shared/infrastructure/utils/bigint.utils';

const data = {
  id: "1",
  name: "Juan",
  user_id: "2"
};

const converted = convertToBigInt(data, ['id', 'user_id']);
// Resultado: { id: BigInt(1), name: "Juan", user_id: BigInt(2) }
```

### `convertToString(obj: any, idFields?: string[]): any`
Convierte campos específicos de un objeto a `string`.

**Uso:**
```typescript
import { convertToString } from '../shared/infrastructure/utils/bigint.utils';

const data = {
  id: BigInt(1),
  name: "Juan",
  user_id: BigInt(2)
};

const converted = convertToString(data, ['id', 'user_id']);
// Resultado: { id: "1", name: "Juan", user_id: "2" }
```

## Middleware

### `bigIntSerializationMiddleware`
Middleware que serializa automáticamente las respuestas JSON.

**Uso:**
```typescript
import { bigIntSerializationMiddleware } from '../shared/infrastructure/middlewares/bigint.middleware';

app.use(bigIntSerializationMiddleware);
```

### `bigIntDeserializationMiddleware`
Middleware que deserializa automáticamente los request bodies.

**Uso:**
```typescript
import { bigIntDeserializationMiddleware } from '../shared/infrastructure/middlewares/bigint.middleware';

app.use(bigIntDeserializationMiddleware);
```

## Campos por Defecto

Los siguientes campos se convierten automáticamente:
- `id`
- `user_id`
- `member_id`
- `ministry_id`
- `event_id`
- `role_id`

## Ejemplos de Uso

### En Controladores
```typescript
import { serializeBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';

export class MyController {
  static async getData(req: Request, res: Response) {
    const result = await MyService.getData();
    
    return res.status(200).json({
      status: 200,
      message: result.message,
      data: serializeBigInt(result.data)
    });
  }
}
```

### En Middleware Global
```typescript
import { bigIntSerializationMiddleware } from './shared/infrastructure/middlewares/bigint.middleware';

app.use(bigIntSerializationMiddleware);
```

### En Servicios
```typescript
import { convertToBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';

export class MyService {
  static async processData(data: any) {
    const convertedData = convertToBigInt(data, ['id', 'user_id']);
    // Procesar datos...
  }
}
```
