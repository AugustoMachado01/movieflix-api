"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const port = 3000;
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.get("/movies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const movies = yield prisma.movie.findMany({
        orderBy: { title: "asc" },
        include: {
            Genre: true,
            Language: true,
        },
    });
    res.json(movies);
}));
app.post("/movies", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    if (typeof title === "number" || title.length === 0) {
        return res.status(500).send("Titulo não pode ser um numero ou vazio");
    }
    if (typeof genre_id === "string" || genre_id === undefined) {
        return res.status(500).send("Genero não pode ser um texto ou vazio");
    }
    if (typeof language_id === "string" || genre_id.lenght) {
        return res.status(500).send("lingua não pode ser vazio");
    }
    if (typeof genre_id === "string" || genre_id === undefined) {
        return res.status(500).send("Genero não pode ser um texto ou vazio");
    }
    try {
        // check if a movie exists in the database
        const movieWithSameTitle = yield prisma.movie.findFirst({
            where: {
                title: {
                    equals: title.toLowerCase(),
                },
            },
        });
        if (movieWithSameTitle) {
            return res
                .status(409)
                .send({ message: "já existe um filme cadastrado com  esse nome " });
        }
        yield prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Falha ao cadastrar um filme" });
    }
    res.status(201).send("criado com sucesso");
}));
app.put("/movies/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
    }
    try {
        const movie = yield prisma.movie.findFirst({ where: { id } });
        if (!movie) {
            return res.status(404).json({ message: "Filme não encontrado" });
        }
        const movieUpdate = yield prisma.movie.update({
            where: { id },
            data: {
                release_date: req.body.release_date
                    ? new Date(req.body.release_date)
                    : movie.release_date,
                title: req.body.title || movie.title,
            },
        });
        return res
            .status(200)
            .json({ message: "Atualizado com sucesso", movie: movieUpdate });
    }
    catch (error) {
        if (error instanceof Error) {
            return res
                .status(500)
                .json({ message: "Falha ao atualizar o filme", error: error.message });
        }
        return res
            .status(500)
            .json({ message: "Falha desconhecida ao atualizar um filme" });
    }
}));
app.listen(port, () => {
    console.log(`Servidor rodsando na porta ${port}`);
});
