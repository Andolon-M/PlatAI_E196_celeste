import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import fs from 'fs';



// Función para encontrar automáticamente todos los archivos de rutas
const findRouteFiles = (): string[] => {
  try {
    // Directorios donde buscar archivos de rutas
    const directories = [
      path.join(__dirname, '../../modules'),
      path.join(__dirname, '../../routes')
    ];
    
    const routeFiles: string[] = [];
    
    // Función recursiva para buscar archivos en directorios y subdirectorios
    const searchFiles = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Buscar recursivamente en subdirectorios
          searchFiles(fullPath);
        } else if (stat.isFile()) {
          // Verificar si es un archivo de rutas o documentación swagger
          if (
            item.endsWith('.routes.ts') || 
            item === 'routes.ts' ||
            item.endsWith('.swagger.ts') ||
            item.endsWith('.routers.swagger.ts') ||
            (item.endsWith('.ts') && dir.includes('/routes'))
          ) {
            // Convertir a path relativo para swagger
            const relativePath = './' + path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
            routeFiles.push(relativePath);
          }
        }
      }
    };
    
    // Buscar en cada directorio principal
    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        searchFiles(dir);
      }
    });
    
    // console.log('🔍 Archivos de rutas encontrados para Swagger:', routeFiles);
    return routeFiles;
  } catch (error) {
    console.error('❌ Error buscando archivos de rutas:', error);
    // En caso de error, usar rutas predefinidas seguras
    return [
      './src/modules/auth/auth.routes.ts',
      './src/modules/auth/routers/auth.routers.swagger.ts',
      './src/modules/game/game.routes.ts',
      './src/modules/authorization/routes.ts',
      './src/routes/router.ts'
    ];
  }
};

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API SIGA myApp',
            version: '1.0.0',
            description: 'Documentación de la API de SIGA myApp',
            contact: {
                name: 'myApp Team',
                email: 'support@hunters-campus.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        // Base sin /api: los paths en la spec son /api/... así la URL final es correcta (no api/api).
        servers: [
            {
                url: `http://${process.env.API_BASE_URL_LOCAL ?? 'localhost'}:${process.env.EXPRESS_PORT ?? '3000'}`,
                description: 'Servidor local (default)'
            },
            {
                url: (() => {
                    const b = (process.env.API_BASE_URL ?? '').trim();
                    if (!b) return 'https://miApp.com';
                    const href = b.startsWith('http') ? b : `https://${b}`;
                    return new URL(href).origin;
                })(),
                description: 'Servidor de producción'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token de autenticación JWT. Ejemplo: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Mensaje de error'
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID del usuario'
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del usuario'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email del usuario'
                        },
                        role: {
                            type: 'string',
                            description: 'Rol del usuario'
                        }
                    }
                },
                Permission: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID del permiso'
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del permiso'
                        },
                        description: {
                            type: 'string',
                            description: 'Descripción del permiso',
                            nullable: true
                        },
                        resource: {
                            type: 'string',
                            description: 'Recurso al que aplica el permiso'
                        },
                        action: {
                            type: 'string',
                            description: 'Acción permitida (create, read, update, delete)'
                        }
                    }
                },
                Role: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID del rol'
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del rol'
                        },
                        description: {
                            type: 'string',
                            description: 'Descripción del rol',
                            nullable: true
                        }
                    }
                },
                Game: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID del juego'
                        },
                        name: {
                            type: 'string',
                            description: 'Nombre del juego'
                        },
                        description: {
                            type: 'string',
                            description: 'Descripción del juego'
                        },
                        rules: {
                            type: 'string',
                            description: 'Reglas del juego'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'usuario@ejemplo.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: '123456'
                        }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: {
                            type: 'string',
                            example: 'Juan Pérez'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'juan@ejemplo.com'
                        },
                        password: {
                            type: 'string',
                            format: 'password',
                            example: '123456'
                        }
                    }
                }
            }
        },
        security: [{
            bearerAuth: []
        }]
    },
    // Usar la función de detección automática para encontrar archivos con documentación
    apis: [
        ...findRouteFiles(),
        './src/config/middlewares/*.{js,ts}',
        './dist/config/middlewares/*.js',
        './src/modules/*/*.routes.{js,ts}',
        './dist/modules/*/*.routes.js',
        './src/modules/*/routers/*.swagger.{js,ts}',
        './src/modules/*/routers/*.routers.swagger.{js,ts}'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 