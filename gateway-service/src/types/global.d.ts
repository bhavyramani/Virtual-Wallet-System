// src/types/global.d.ts
declare namespace Express {
    export interface Request {
      user?: any; // You can change the type of 'user' to match your JWT payload
    }
  }
  