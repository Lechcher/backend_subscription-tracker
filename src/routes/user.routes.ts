import { Hono } from 'hono';

const userRoutes = new Hono();

userRoutes.get("/", (c) => {
    return c.json({
        message: 'Get All Users',
    })
})

userRoutes.get("/:id", (c) => {
    const id = c.req.param("id");

    return c.json({
        message: `Get User ${id} by ID`,
    })
})

userRoutes.post("/", (c) => {
    return c.json({
        message: 'Create New User',
    })
})

userRoutes.put("/:id", (c) => {
    const id = c.req.param("id");
    return c.json({
        message: `Update User ${id}`,
    })
})

userRoutes.delete("/:id", (c) => {
    const id = c.req.param("id");
    return c.json({
        message: `Delete User ${id}`,
    })
})

export default userRoutes;
