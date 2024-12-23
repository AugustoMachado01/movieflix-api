import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

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
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;

  if (typeof title === "number" || title.lenght === 0) {
    return res.status(500).send("Titulo não pode ser  um numero ou vazio");
  }

  if (typeof genre_id === "string" || genre_id.lenght) {
    return res.status(500).send("Genero não pode ser um texto ou vazio");
  }

  if (typeof language_id === "string" || genre_id.lenght) {
    return res.status(500).send("lingua não pode ser vazio");
  }

  if (typeof genre_id === "string" || genre_id.lenght) {
    return res.status(500).send("Genero não pode ser um texto ou vazio");
  }

  try {
    await prisma.movie.create({
      data: {
        title,
        genre_id,
        language_id,
        oscar_count,
        release_date: new Date(release_date),
      },
    });
  } catch (error: unknown) {
    return res.status(500).json({ message: "Falha ao cadastrar um filme" });
  }
  res.status(201).send("criado com sucesso");
});

app.listen(port, () => {
  console.log(`Servidor rodsando na porta ${port}`);
});
