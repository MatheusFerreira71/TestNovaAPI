const Post = require('../models/Post');
const Tag = require('../models/Tag');
require('../models/Categoria');
const PostCategoria = require('../models/PostCategoria');
const PostTag = require('../models/PostTag');
const Comentario = require('../models/Comentario');

module.exports = {
    create: async (req, res) => {
        try {
            const { titulo, descricao, corpo, banner, usuario } = req.body;
            const createdPost = await Post.create({ titulo, descricao, corpo, banner, usuario });
            const { _id } = createdPost;

            const { categorias, tags } = req.body;
            const createdTags = [];

            for (const tag of tags) {
                createdTags.push(await Tag.findOneOrCreate(tag, tag));
            }

            const tagIds = createdTags.map(tag => tag._id);

            const parsedCatIds = categorias.map(categoria => ({ catId: categoria, postId: _id }));
            const parsedTagIds = tagIds.map(tagId => ({ tagId, postId: _id }));

            await PostCategoria.create(parsedCatIds);
            await PostTag.create(parsedTagIds);

            res.sendStatus(201);
        } catch (erro) {
            console.log(erro);
            // HTTP 500: Internal Server Error
            res.status(500).send(erro);
        }
    },
    update: async (req, res) => {
        try {
            const { _id } = req.body;
            const { titulo, descricao, corpo, banner } = req.body;
            const post = await Post.findByIdAndUpdate(_id, { titulo, descricao, corpo, banner });
            if (!post) {
                res.status(404).end();
            }
            await PostCategoria.deleteMany({ postId: _id });
            await PostTag.deleteMany({ postId: _id });

            const { categorias, tags } = req.body;
            const createdTags = [];

            for (const tag of tags) {
                createdTags.push(await Tag.findOneOrCreate(tag, tag));
            }

            const tagIds = createdTags.map(tag => tag._id);

            const parsedCatIds = categorias.map(categoria => ({ catId: categoria, postId: _id }));
            const parsedTagIds = tagIds.map(tagId => ({ tagId, postId: _id }));

            await PostCategoria.create(parsedCatIds);
            await PostTag.create(parsedTagIds);

            res.sendStatus(201);
        } catch (erro) {
            console.log(erro);
            res.status(500).send(erro);
        }
    },
    delete: async (req, res) => {
        try {
            const { _id } = req.body;
            // Encontra a post pelo seu id e retorna o objeto encontrado que foi excluído.
            const post = await Post.findByIdAndDelete(_id);
            if (!post) {
                //post encontrado e excluída.
                res.status(404).end(); // HTTP 204: No content
            }
            await PostCategoria.deleteMany({ postId: _id });
            await PostTag.deleteMany({ postId: _id });
            await Comentario.deleteMany({ postId: _id });
            res.status(200).end();
        } catch (erro) {
            console.log(erro);
            // HTTP 500: Internal Server Error
            res.status(500).send(erro);
        }
    },
    indexCatOrTag: async (req, res) => {
        try {
            const { id, type } = req.query;
            const collections = {
                PostCategoria: await PostCategoria.find({ catId: id }).populate('postId'),
                PostTag: await PostTag.find({ tagId: id }).populate('postId')
            }
            const posts = collections[type];
            res.json(posts);
        } catch (erro) {
            console.log(erro);
            // HTTP 500: Internal Server Error
            res.status(500).send(erro);
        }
    },
    show: async (req, res) => {
        try {
            const { id } = req.params;

            const post = await Post.findById(id);
            if (!post) {
                res.status(404).end();
            }
            const categorias = await PostCategoria.find({ postId: id })
                .populate({ path: 'catId', select: 'titulo' }).select('catId');
            const tags = await PostTag.find({ postId: id })
                .populate({ path: 'tagId', select: 'titulo' }).select('tagId');

            res.json({post, categorias, tags});
        } catch (erro) {
            console.log(erro);
            // HTTP 500: Internal Server Error
            res.status(500).send(erro);
        }
    },
    indexByName: async (req, res) => {
        try {
            const { titulo } = req.query;
            const posts = await Post.find({ titulo: { $regex: '.*' + titulo + '.*' } });
            res.json(posts);
        } catch (erro) {
            console.log(erro);
            // HTTP 500: Internal Server Error
            res.status(500).send(erro);
        }
    },
    avaliar: async (req, res) => {
        try {
            const { _id } = req.body;
            const post = await Post.findByIdAndUpdate(_id, req.body);
            if (post) {
                //post encontrado e atualizado
                res.status(204).end(); // HTTP 204: No content
              } else {
                //Http 404: Not found.
                res.status(404).end();
              }
        } catch (erro) {
            console.log(erro);
            // HTTP 500: Internal Server Error
            res.status(500).send(erro);
        }
    }
};