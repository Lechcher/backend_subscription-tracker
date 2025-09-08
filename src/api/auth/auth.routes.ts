import { Hono } from 'hono';

const authRoutes = new Hono();

authRoutes.post('/sign-up', (c) => {
    return c.json({
        message: 'Sign Up',
    })
})

authRoutes.post("/sign-in", (c) => {
    return c.json({
        message: 'Sign Up',
    })
})

authRoutes.post("/sign-out", (c) => {
    return c.json({
        message: 'Sign Out',
    })
})

export default authRoutes;