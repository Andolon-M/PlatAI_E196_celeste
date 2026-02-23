import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../../../config/database/db';

// Objeto que se pasa a done() y llega a req.user (incluye tokens para persistir en BD)
export interface PassportUser {
  userId: string;
  email: string;
  google_id?: string;
  image?: string;
  accessToken?: string;
  refreshToken?: string;
}

// Determinar si estamos en producción
const isProduction = process.env.EXPRESS_PRODUCTION?.toLowerCase() === 'true';

// Construir URL de callback dinámicamente según el entorno
const getCallbackUrl = (): string => {
  const baseUrl = isProduction
    ? `https://${process.env.API_BASE_URL}`
    : `http://${process.env.API_BASE_URL_LOCAL}:${process.env.EXPRESS_PORT}`;

  const callbackPath = process.env.GOOGLE_CALLBACK_PATH || '/api/auth/google/callback';
  return `${baseUrl}${callbackPath}`;
};

// Configuración de la estrategia de Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: getCallbackUrl(),
  scope: ['profile', 'email']
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar si el usuario ya existe
      const existingUser = await prisma.users.findFirst({
        where: {
          OR: [
            { google_id: profile.id },
            { email: profile._json.email }
          ]
        }
      });

      // Si el usuario existe, actualizamos google_id e image y pasamos tokens al controller
      if (existingUser) {
        await prisma.users.update({
          where: { id: existingUser.id },
          data: {
            google_id: profile.id,
            image: profile._json.picture || existingUser.image
          }
        });
        const updatedUser: PassportUser = {
          userId: existingUser.id.toString(),
          email: existingUser.email,
          google_id: profile.id,
          image: profile._json.picture || existingUser.image || undefined,
          accessToken,
          refreshToken: refreshToken || undefined
        };
        return done(null, updatedUser as any);
      }

      // Usuario nuevo: será creado por AuthService.googleLogin; pasamos tokens para guardarlos
      const userData: PassportUser = {
        userId: "",
        email: profile._json.email || "",
        google_id: profile.id,
        image: profile._json.picture,
        accessToken,
        refreshToken: refreshToken || undefined
      };
      return done(null, userData as any);
    } catch (error) {
      return done(error as Error);
    }
  }
));

// Serialización del usuario para la sesión
passport.serializeUser((user: any, done) => {
  done(null, user.userId || "");
});

// Deserialización del usuario
passport.deserializeUser(async (id: string, done) => {
  try {
    if (!id) {
      return done(null, null);
    }
    
    const user = await prisma.users.findUnique({
      where: { id: BigInt(id) }
    });
    
    if (user) {
      const userResponse: PassportUser = {
        userId: user.id.toString(),
        email: user.email
      };
      done(null, userResponse as any);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error);
  }
});

export default passport; 