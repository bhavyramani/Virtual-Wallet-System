declare namespace Express {
    interface Request {
      user?: {
        UserId: string;
        Email: string;
      };
    }
  }
  