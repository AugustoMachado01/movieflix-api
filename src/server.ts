import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", async (req, res) => {
  const movies = await prisma.movie.findMany({
    orderBy: { title: "asc" },
    include: {
      Genre: true,
      Language: true,
    },
  });

  res.json(movies);
});

app.post("/movies", async (req, res) => {
  await prisma.movie.create({ data: { title: "filme de teste", genre_id: 1 } });
});

app.listen(port, () => {
  console.log(`Servidor rodsando na porta ${port}`);
});
