import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/movies", async (req: Request, res: Response) => {
  const movies = await prisma.movie.findMany({
    orderBy: { title: "asc" },
    include: {
      Genre: true,
      Language: true,
    },
  });

  res.json(movies);
});

app.post("/movies", async (req: Request, res: Response) => {
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;

  if (typeof title === "number" || title.length === 0) {
    res.status(500).send("Titulo não pode ser um numero ou vazio");
    return;
  }
  if (typeof genre_id === "string" || genre_id === undefined) {
    res.status(500).send("Genero não pode ser um texto ou vazio");
    return;
  }

  if (typeof language_id === "string" || genre_id.lenght) {
    res.status(500).send("lingua não pode ser vazio");
    return;
  }

  if (typeof genre_id === "string" || genre_id === undefined) {
    res.status(500).send("Genero não pode ser um texto ou vazio");
    return;
  }

  try {
    // check if a movie exists in the database
    const movieWithSameTitle = await prisma.movie.findFirst({
      where: {
        title: {
          equals: title.toLowerCase(),
        },
      },
    });

    if (movieWithSameTitle) {
      res
        .status(409)
        .send({ message: "já existe um filme cadastrado com  esse nome " });
      return;
    }
    await prisma.movie.create({
      data: {
        title,
        genre_id,
        language_id,
        oscar_count,
        release_date: new Date(release_date),
      },
    });
  } catch (error) {
    if (error) {
      res.status(500).json({ message: "Falha ao cadastrar um filme" });
      return;
    }
  }
  res.status(201).send("criado com sucesso");
});

app.put("/movies/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "ID inválido" });
    return;
  }

  try {
    const movie = await prisma.movie.findUnique({ where: { id } });

    if (!movie) {
      res.status(404).json({ message: "Filme não encontrado" });
      return;
    }

    const movieUpdate = await prisma.movie.update({
      where: { id },
      data: {
        release_date: new Date(req.body.release_date),
        title: req.body.title || movie.title,
      },
    });

    res
      .status(200)
      .json({ message: "Atualizado com sucesso", movie: movieUpdate });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Falha ao atualizar o filme", error: error.message });
      return;
    }
    res
      .status(500)
      .json({ message: "Falha desconhecida ao atualizar um filme" });
  }
});

app.delete("/movies/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({ where: { id } });

    if (!movie) {
      res.status(404).json({ message: "Filme não encontrado" });
      return;
    }

    await prisma.movie.delete({ where: { id } });

    res.status(200).json({ message: "Filme deletado com sucesso" });
  } catch (error) {
    if (error) {
      res.status(500).json({ message: "Não foi possivel remover o filme" });
    }
  }
});

app.get("/movies/:genreName", async (req: Request, res: Response) => {
  const genreName = req.params.genreName;
  let moviesFilteredByGenreName;

  try {
    moviesFilteredByGenreName = await prisma.movie.findMany({
      include: {
        Genre: true,
        Language: true,
      },
      where: { Genre: { name: { equals: genreName.toLowerCase() } } },
    });
  } catch (error) {
    if (error) {
      res.status(500).json({ message: "Falha ao filtar filmes por genero" });
      return;
    }
  }

  res.status(200).json({
    message: "movie filtrado com sucesso",
    movieFilter: moviesFilteredByGenreName,
  });
});

app.listen(port, () => {
  console.log(`Servidor rodsando na porta ${port}`);
});
